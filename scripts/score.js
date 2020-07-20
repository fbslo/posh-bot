const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');

var hive = require("./hive_engagement.js")

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  bearer_token: config.bearer_token
});

function calculate(){
  con.query(`SELECT * FROM twitter_posts WHERE score IS NULL AND score_time IS NULL`, (err, result) => {
    if(err) console.log("Error with database: Error: "+err)
    else {
      if(result.length != 0){
        getTweetEngagement(result[0], result, 0)
      }
    }
  })
}

function getTweetEngagement(data, array, i){
  client.get('statuses/show/'+data.id, async function(error, tweets, response) {
    if (error) console.log("Error getting Tweet data! Error: "+error)
    else {
      var score = (tweets.retweet_count * 5) + tweets.favorite_count
      hive.getHiveScore(data, (hive_score) => {
        saveDataToDatabase(Number(score + hive_score), data, array, i)
      })
    }
  })
}

function saveDataToDatabase(score, data, array, i){
  con.query("UPDATE twitter_posts SET score = ?, score_time = ? WHERE id = ?;", [score, new Date().getTime(), data.id], (err, result) => {
    if(err) console.log("Error with database: Error: "+err)
    else {
      console.log(score)
      i++
      if(i <= array.length -1){
        getTweetEngagement(array[i], array, i)
      }
    }
  })
}

module.exports.calculate = calculate
