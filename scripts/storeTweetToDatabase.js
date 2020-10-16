const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")

function store(tweetData, hiveLink){
  return new Promise((resolve, reject) => {
    findHiveUsernameForTwitterUser(tweetData.user.screen_name)
      .then((result) => {
        if (result != "not_found") return storeTweet(tweetData, result, hiveLink)
        else resolve('not_found')
      })
      .then((result) => {
        resolve(result)
      })
      .catch(err => reject(err))
  })
}

function findHiveUsernameForTwitterUser(username){
  return new Promise((resolve, reject)  => {
    mongo.get().db("Posh").collection("users").findOne({twitterUsername: username.toLowerCase()}, (err, result) => {
      if (err) reject()
      else {
        if (result == null) resolve("not_found")
        else resolve(result.hiveUsername)
      }
    })
  })
}

function storeTweet(tweetData, hiveUsername, hiveLink){
  return new Promise((resolve, reject) => {
    database.insertOne({
      twitterTweetId: tweetData.id_str,
      twitterUsername: tweetData.user.screen_name,
      hiveUsername: hiveUsername,
      hiveLink: hiveLink,
      timestamp: new Date().getTime(),
      created: tweetData.created_at,
      engagementScore: 'NULL',
      engagementTime: 'NULL',
      tokens: 'NULL',
      tokensTime: 'NULL'
    }, (err, result) => {
      if (err) reject()
      else resolve(tweetData)
    })
  })
}

module.exports.store = store
