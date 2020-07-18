const hive = require("@hiveio/hive-js")
const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  bearer_token: config.bearer_token
});

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
          if(result[i].author == config.account_name){
            isAccountRegistred.push(result[i].author)
          }
        }
        if(isAccountRegistred.length == 0){
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
  client.get('statuses/show/'+id, function(error, tweets, response) {
     if(error) console.log("Error getting Twitter API data! Error: "+error)
     if(tweets.text.includes("register-hive-account")){
       let tweet_split = tweets.text.split("-")
       if(tweet_split[3] == data.author){
         completeRegistration(twitter_account, data)
       }
     }
  });
}

function completeRegistration(twitter, data){
  con.query('SELECT * FROM users WHERE hive = ? OR twitter = ?', [data.author, twitter], (err, result) => {
    if(err) console.log(err)
    else {
      if (result.length == 0){
        let values = [[data.author, twitter.toLowercase(), new Date().getTime(), new Date()]]
        con.query("INSERT INTO users (hive, twitter, time, human_time) VALUES ?", [values], (err, result) => {
          if(err) console.log(err)
          else{
            console.log(`Hive user ${data.author} with Twitter username ${twitter} is now registred.`)
            replyToComment(`Twitter account ${twitter} was registered to Hive account ${data.author}!`, data, twitter)
          }
        })
      } else {
        console.log(`Hive user ${data.author} or Twitter account ${twitter} is already registerd`)
        replyToComment(`Hive user ${data.author} or Twitter account ${twitter} is already registerd`, data, twitter)
      }
    }
  })
}

async function replyToComment(message, data, twitter){
  let permlink = makeid(10).toLowerCase()
  let jsonMetadata = JSON.stringify({
          app: `posh-bot`,
          author: 'fbslo'
        })
  hive.broadcast.comment(config.posting_key, data.author, data.permlink, config.account_name, permlink, '', message, jsonMetadata, function(err, result) {
    if(err) console.log('Error posting comment! Error: '+err)
    else {
      console.log("Reply to coment was posted!")
    }
  });
}

function makeid(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

module.exports.new_registrations = new_registrations
