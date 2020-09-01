const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  bearer_token: config.bearer_token
});

let points  = 500

function give(){
  let one_day = new Date().getTime() - 86400000
  con.query(`SELECT * FROM twitter_posts WHERE points IS NULL AND points_time IS NULL AND score_time <= ${one_day};`, (err, result) => {
    if(err){
      console.log("Error with database: Error: "+err)
    } 
    else {
      var total_score = 0
      if(result.length != 0){
        for(i in result){
          total_score += result[i].score
        }
        var points_per_score = points / total_score
        let accounts = []
        for (i in result){
          accounts.push({account: result[i].user_name, points: parseFloat(points_per_score * result[i].score), tweet_id: result[i].id})
        }
        saveDataToDatabase(accounts[0], accounts, 0)
      }
    }
  })
}

function saveDataToDatabase(data, array, i){
  console.log(`Saving ${data.points} for tweet ${data.tweet_id}!`)
  con.query("UPDATE twitter_posts SET points = ?, points_time = ? WHERE id = ?;", [data.points, new Date().getTime(), data.tweet_id], (err, result) => {
    if(err) console.log("Error with database: Error: "+err)
    else {
      i++
      if(i <= array.length -1){
        saveDataToDatabase(array[i], array, i)
      }
    }
  })
}

module.exports.give = give
