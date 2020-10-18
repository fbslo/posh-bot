const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")
const got = require('got')
const hive = require('@hiveio/hive-js')
const Twit = require('twit')

var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

function calculate(){
  database.findOne({timestamp: {$gt: new Date().getTime() - 86400000}, engagementScore: 'NULL'}, async (err, result) => { //find all tweets older than one day
    if (err) console.log(`Error calculating engagementScore! Database error: ${err}`)
    else {
      if (result == null) console.log(`No new tweets to calculate engagementScore for.`)
      else {
        for (i in result){
          await calculateEngagementScore(result[i])
        }
      }
    }
  })
}

function calculateEngagementScore(data){
  return new Promise((resolve, reject) => {
    let { twitterTweetId, hiveUsername, hiveLink } = data
    T.get('statuses/show/:id', { id: twitterTweetId }, async function(err, data, response) {
      if (err) resolve(err)
      else {
        let retweets = data.retweet_count
        let likes = data.favorite_count
        let engegementScore = (retweets * 5) + likes
        if (hiveUsername && hiveLink){
          let hiveEnagementScore = await hiveEnagementScoreFunction(hiveLink, hiveUsername)
          engegementScore += hiveEnagementScore
          storeTweedEngagement(twitterTweetId, engegementScore)
        } else {
          console.log(`Data does not include hiveUsername or hiveLink @ calculateEngagementScore()`)
          storeTweedEngagement(twitterTweetId, engegementScore)
        }
      }
    })
  })
}

async function hiveEnagementScoreFunction(hiveLink, hiveUsername){
  return new Promise(async (resolve, reject) =>  {
    try {
      if(hiveLink.includes("3speak.co")){
        //https://3speak.co/watch?v= username /permlink?maybe=something
        if(hiveLink.split("=")[1].split("/")[0] == hiveUsername){
          let permlink = hiveLink.split("=")[1].split("/")[1]
          if (permlink.includes('?')) permlink = permlink.split('?')[0] //remove possible ?maybe=something
          let hiveEnagementScore = await getHivePostScore(hiveUsername, permlink)
          resolve(hiveEnagementScore)
        } else {
          resolve(0)
        }
      } else if(hiveLink.includes('hive.blog') || hiveLink.includes('peakd') || hiveLink.includes("leofinance.io")){
        //https://url.com/maybe_tag/ @username / permlink?maybe=something
        if(hiveLink.split("@")[1].split("/")[0] == hiveUsername){
          let permlink = hiveLink.split('@')[1].split("/")[1]
          if (permlink.includes('?')) permlink = permlink.split('?')[0]
          let hiveEnagementScore = await getHivePostScore(hiveUsername, permlink)
          resolve(hiveEnagementScore)
        } else {
          resolve(0)
        }
      } else {
        resolve(0)
      }
    } catch (e) {
      console.log("Error while getting Hive enagagement data. Details: "+e)
      resolve(0)
    }
  })
}

function getHivePostScore(username, permlink){
  return new Promise((resolve, reject) => {
    hive.api.getContentReplies(author, permlink, async function(err, result) {
      if (err) resolve(0)
      else {
        if (result.length == 0) resolve(0)
        else {
          let validReplies = []
          for (i in result){
            let isValidReply = await isValidReplyFunction(result[i].author)
            if (isValidReply == true) validReplies.push(result[i].author)
          }
          validReplies = [...new Set(validReplies)];
          resolve(validReplies.length * 5) //each vvalid comment author * 5
        }
      }
    });
  })
}

async function isValidReplyFunction(author){
  try {
    let isEngageHolder = []
    var response = await got('https://accounts.hive-engine.com/accountHistory?account='+user)
    let data = JSON.parse(response.body)
    for (i in data){
      if(data[i].symbol == "ENGAGE"){
        isEngageHolder.push(true)
      }
    }
    if(isEngageHolder.length > 0){
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log("Error while getting ENGAGE details. Details: "+e)
    return false
  }
}

function storeTweedEngagement(twitterTweetId, engegementScore){
  database.updateOne({twitterTweetId: twitterTweetId}, {
    $set: {
      engagementTime: new Date().getTime(),
      engagementScore: engegementScore
    }
  }, (err, result) => {
    if (err) console.log(`Error storing engagementScore for tweet ${twitterTweetId}.`)
    else console.log(`Tweet ${twitterTweetId} engagementScore updated!`)
  })
}
module.exports.calculate = calculate
