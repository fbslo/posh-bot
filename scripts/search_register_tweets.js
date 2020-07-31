const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');
const hive = require("@hiveio/hive-js")

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

function start(){
  var stream = client.stream('statuses/filter', {track: '#poshbotregistration', tweet_mode: 'extended'});
  stream.on('data', function(event) {
    if(!event.retweeted_status){
      processTweet(event)
    }
  });

  stream.on('error', function(error) {
    console.log("Error getting Tweets from API (registration search): "+ error)
    setTimeout(() => {
      start()
    }, 5000)
  });
}

function processTweet(data){
  let id;
  if(data.extended_tweet){
    id = data.extended_tweet.full_text.split(" ")[1]
  } else {
    id = data.text.split(" ")[1]
  }
  con.query("SELECT * FROM registration WHERE id = ? AND used = '0';", [id], (err, result) => {
    if(err) console.log(`Error selecting id: ${id}`)
    else {
      if(result.length == 0) console.log(`No registration with id: ${id} found`)
      else {
        let values = [[result[0].hive, data.user.screen_name, new Date().getTime(), new Date()]]
        con.query("INSERT INTO users (hive, twitter, time, human_time) VALUES ?", [values], (err1, result1) => {
          if(err1) console.log(err1)
          else{
            console.log(`Hive user ${result[0].hive} with Twitter username ${data.user.screen_name} is now registered.`)
            upadateRegistrationTable(id)
            replyToComment(`Twitter account ${data.user.screen_name} was registered to Hive account ${result[0].hive}!`, result[0].hive, data.user.screen_name)
          }
        })
      }
    }
  })
}

function upadateRegistrationTable(id){
  con.query("UPDATE registration SET used = '1' WHERE id = ?", [id], (err, result) => {
    if(err)  console.log("Error updating registration table for id: "+id)
  })
}

function replyToComment(message, hive_username, twitter){
  var permlink = makeid(15).toLowerCase()
  var jsonMetadata = JSON.stringify({
          app: `posh-bot`,
          author: 'fbslo'
        })
  let query = {tag: hive_username, limit: 2}
  hive.api.getDiscussionsByBlog(query, function(err, blog) {
    if(err) console.log("Error getting blog for "+hive)
    else {
      hive.broadcast.comment(config.posting_key, blog[0].author, blog[0].permlink, config.account_name, permlink, '', message, jsonMetadata, function(err, result) {
        if(err) console.log('Error posting comment! Error: '+err)
        else {
          console.log("Reply to coment was posted!")
        }
      });
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

module.exports.start = start
