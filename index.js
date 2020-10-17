const express =  require("express");
require("dotenv").config()
const schedule = require('node-schedule')

const app = express();
const mongo = require("./mongo.js")

mongo.connect()
  .then(() => main())
  .catch(err => console.log(err))

async function main(){
  const streamHiveBlockchain = require("./scripts/streaming/scanHiveBlockchain.js")
  const streamTwitter = require("./scripts/streaming/scanTwitter.js")
  const verifyRegistrationTweet = require("./scripts/verifyRegistrationTweet.js")
  const hiveReply = require("./scripts/hiveBroadcast/hiveReply.js")
  const storeUserToDatabase = require("./scripts/storeUserToDatabase.js")
  const doesTweetIncludeHiveLink = require("./scripts/doesTweetIncludeHiveLink.js")
  const storeTweetToDatabase = require("./scripts/storeTweetToDatabase.js")
  const calculateEngagementScore = require("./scripts/calculateEngagementScore.js")
  const calculateTokens = require("./scripts/calculateTokens.js")
  const dailyPost = require("./scripts/dailyPost.js")

  console.log("Posh bot is waking up...")
  streamHiveBlockchain.start((registrationData) => {
    if (registrationData.isSuccess == true) {
      storeUserToDatabase.isUserAlreadyStored(registrationData.twitterUsername, registrationData.hiveUsername)
        .then((result) => {
          if (result != 'user_not_stored') return;
          else {
            //verify registration tweet and store user
            verifyRegistrationTweet.verify(registrationData.twitterTweetId, registrationData.hiveUsername)
              .then((result) => {
                if (result != false){
                  storeUserToDB(storeUserToDatabase, hiveReply, registrationData)
                } else {
                  //hiveReply.reply(`@${registrationData.hiveUsername}, your Tweet doesen't seems to be in the correct format!`, registrationData)
                }
              })
              .catch((err) => {
                console.log(err)
                //hiveReply.reply(`@${registrationData.hiveUsername}, there was an error while processing your request. Please try again later.`, registrationData)
              })
          }
        })
    }
    else hiveReply.reply(`@${registrationData.hiveUsername}, there was an error while processing your request. Please try again later.`, registrationData)
  })

  streamTwitter.start((tweetData) => {
    if (!tweetData.retweeted_status){ //is not a retweet
      doesTweetIncludeHiveLink.check(tweetData)
        .then((result) => {
          if (result == false) return; //console.log(`Tweet by ${tweetData.user.screen_name} does not include Hive link.`)
          else storeTweetToDatabase.store(tweetData, result).then((result) => {
            if (result == 'not_found') return; //console.log(`User @${tweetData.user.screen_name} is not registered!`)
            else console.log(`Tweet @${tweetData.user.screen_name}/${tweetData.id_str} stored.`)
          })
        })
    }
  })

  schedule.scheduleJob('30 * * * *', () => {
    calculateEngagementScore.calculate()
  }) // run everyday 30 minutes

  schedule.scheduleJob('0 0 * * *', () => {
    calculateTokens.calculate()
      .then((result) => {
        dailyPost.submit(result)
      })
  }) // run everyday at midnight
}

function storeUserToDB(storeUserToDatabase, hiveReply, registrationData){
  storeUserToDatabase.storeUser(registrationData)
    .then((result) => {
      //user not registered already
      if (result != undefined) hiveReply.reply(`@${registrationData.hiveUsername}, your were connected to twitter username ${registrationData.twitterUsername}!`, registrationData)
    })
    .catch((err) => {
      console.log(err)
      //hiveReply.reply(`@${registrationData.hiveUsername}, there was an error while processing your request.`, registrationData)
    })
}
