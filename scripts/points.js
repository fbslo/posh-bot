const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');

const got = require('got');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  bearer_token: config.bearer_token
});

let points  = 1000

function give(){
  let one_day = new Date().getTime() - 86400000
  con.query(`SELECT * FROM twitter_posts WHERE points  IS NULL AND points_time IS NULL AND score_time <= ${one_day};`, (err, result) => {
    if(err) console.log("Error with database: Error: "+err)
    else {
      var total_score = 0
      if(result.length != 0){
        for(i in result){
          total_score += result[i].score
        }
        var points_per_score = points / total_score
        let accounts = []
        for (i in result){
          accounts.push({account: result[i].user_name, points: parseFloat(points_per_score * result[i].score).toFixed(3), tweet_id: result[i].id, hive_post: result[i].hive_post, hive_username: result[i].hive_username})
        }
        //saveDataToDatabase(accounts[0], accounts, 0)
        for (i in accounts){
          addHiveEngagement(accounts[i])
        }
      }
    }
  })
}

async function addHiveEngagement(data){
  if(data.hive_post.includes("3speak.online")){
    if(data.hive_post.split("=")[1].split("/")[0] == data.hive_username){
      let engage = await isEngageHolder(data.hive_username)
      if(engage == true){
        getPostEngagement(data.hive_username, data.hive_post.split("=")[1].split("/")[1], data)
      }
    }
  } else {
    if(data.hive_post.split("@")[1].split("/")[0] == data.hive_username){
      let engage = isEngageHolder(data.hive_username)
      if(engage == true){
        getPostEngagement(data.hive_username, data.hive_post.split("@")[1].split("/")[1], data)
      }
    }
  }
}

async function getPostEngagement(author, permlink, data){
  hive.api.getContentReplies(author, permlink, async function(err, result) {
    if(err) console.log(`Error getting post ${author}/${permlink}! Error: ${err}`)
    else {
      let holders = []
      async function checkHolders(result, i){
        let isHolder = await isEngageHolder(result[i].author)
        if(isHolder == true){
          holders.push(result[i].author)
        }
        i++
        if(i != result.length-1){
          checkHolders(result, i)
        } else {
          calculateHiveScore(holders, data)
        }
      }
      checkHolders(result, 0)
    }
  });
}

async function isEngageHolder(user){
  let isEngageHolder = []
  var response = await got('https://accounts.hive-engine.com/accountHistory?account='+user)
  for (i in response){
    if(response.data[i].symbol == "ENGAGE"){
      isUserEnagageHolder.push(true)
    }
  }
  if(isUserEnagageHolder.length > 0){
    return true
  } else {
    return false
  }
}

function calculateHiveScore(holders, data){
  let hiveScore = holders.length * 5
  data["score"] = data["score"] + hiveScore
  saveDataToDatabase(data)
}

function saveDataToDatabase(data){
  con.query("UPDATE twitter_posts SET points = ?, points_time = ? WHERE id = ?;", [data.points, new Date().getTime(), data.tweet_id], (err, result) => {
    if(err) console.log("Error with database: Error: "+err)
  })
}

module.exports.give = give
