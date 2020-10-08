const express =  require("express");
require("dotenv").config()

var app = express();
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

  console.log("Posh bot is waking up...")
  streamHiveBlockchain.start((registrationData) => {
    if (registrationData.isSuccess == true) {
      verifyRegistrationTweet.verify(registrationData.twitterTweetId, registrationData.hiveUsername)
        .then((result) => {
          if (result != false){
            storeUserToDB(storeUserToDatabase, hiveReply, registrationData)
          } else {
            hiveReply.reply(`@${registrationData.hiveUsername}, your Tweet doesen't seems to be in correct format!`, registrationData)
          }
        })
        .catch((err) => {
          console.log(err)
          hiveReply.reply(`@${registrationData.hiveUsername}, there was an error while processing your request.<br>Are you sure your registration comment and tweet are in the correct format?<br>If you need more info, please read this post: [Info and FAQ](@acidyo/posh-info-and-faq).`, registrationData)
        })
    }
    else hiveReply.reply(`@${registrationData.hiveUsername}, there was an error while processing your request.<br>Are you sure your registration comment and tweet are in the correct format?<br>If you need more info, please read this post: [Info and FAQ](@acidyo/posh-info-and-faq).`, registrationData)
  })
}

function storeUserToDB(storeUserToDatabase, hiveReply, registrationData){
  storeUserToDatabase.isUserAlreadyStored(registrationData.twitterUsername, registrationData.hiveUsername)
    .then((result) => {
      if (result == 'user_not_stored'){
        return storeUserToDatabase.storeUser(registrationData)
      }
      else console.log(`User ${registrationData.hiveUsername} already stored!`)
    })
    .then((result) => {
      hiveReply.reply(`@${registrationData.hiveUsername}, your were connected to twitter username ${registrationData.twitterUsername}!`, registrationData)
    })
    .catch((err) => {
      console.log(err)
      hiveReply.reply(`@${registrationData.hiveUsername}, there was an error while processing your request.<br>Are you sure your registration comment and tweet are in the correct format?<br>If you need more info, please read this post: [Info and FAQ](@acidyo/posh-info-and-faq).`, registrationData)
    })
}
