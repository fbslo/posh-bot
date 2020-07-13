const hive = require("@hiveio/hive-js")
const con = require('../database.js')
const config = require("../config.json")

//register https://twitter.com/GPujs/status/1279072304299937793

async function new_registrations(){
  hive.api.getContentReplies('posh-bot', 'register-your-twitter-account', function(err, result) {
    if(err) console.log("Error getting new registrations! Error: "+err)
    else {
      for (i in result){
        if(result[i].body.split(" ")[0] == "register" && result[i].body.split(" ")[1].includes("https://twitter.com")){
          isAlreadyRegistred(result[i])
        }
      }
    }
  });
}

function isAlreadyRegistred(data){
  hive.api.getContentReplies(data.author, data.permlink, function(err, result) {
    if(err) console.log("Error getting new registrations! Error: "+err)
    else {
      if(result.length == 0){
        checkTwitterData(data)
      } else {
        let isAccountRegistred = []
        for (i in result){
          if(result[i].author != config.account_name){
            isAccountRegistred.push(result[i].author)
          }
        }
        if(result.length != isAccountRegistred.length){
          checkTwitterData(data)
        }
      }
    }
  });
}

function checkTwitterData(data){
  let tweet = data.body.split(" ")
  let id = tweet[1].split("/")[5]
  let twitter_account = tweet[1].split("/")[3]
  // TODO: when you get twitter API,  make request to get tweet data
  //completeRegistration(twitter_account, data)
}

function completeRegistration(twitter, data){
  let values = [[data.author, twitter, new Date().getTime(), new Date()]]
// TODO: add check if user is already registred
  con.query("INSERT INTO users (hive, twitter, time, human_time) VALUES ?", [values], (err, result) => {
    if(err) console.log(err)
    else console.log(`User ${data.author} with Twitter username ${twitter} is registred.`)
  })
}

module.exports.new_registrations = new_registrations
