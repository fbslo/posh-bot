const hive = require("@hiveio/hive-js")
const con = require('../database.js')
const config = require("../config.json")


var list = [['geadriana', "adrianagam"], ["dimeshana", "Shanillet"], ["mballesteros", "mariangel1608"], ["angelica7", "lmartinezmdl"], ["marybellrg", "MARYBELLRG"], ["edje", "hggnooo"]]

start(0, list)

function start(i, list){
  setTimeout(() => {
    if(i <= list.length -1){
      isAlreadyThere(list[i][0], list[i][1], i, list)
    } else {
      console.log("End of list")
    }
  }, 4000)
}

function isAlreadyThere(hive_username, twitter_username, i, list){
  con.query("SELECT * FROM users WHERE hive = '"+hive_username+"';", (err, result) => {
    if(err) console.log(err)
    else {
      if(result.length == 0) process(list[i][0], list[i][1], i, list)
      else {
        console.log(`User ${hive_username}, ${twitter_username} is already registered`);
        start(i+1, list)
      }
    }
  })
}


function process(hive_username, twitter_username, i, list){
  var values = [[hive_username.toLowerCase(), twitter_username.toLowerCase(), new Date().getTime(), new Date()]]
  con.query("INSERT INTO users (hive, twitter, time, human_time) VALUES ?", [values], (err1, result1) => {
    if(err1) console.log(err1)
    else{
      console.log(`Hive user ${hive_username.toLowerCase()} with Twitter username ${twitter_username.toLowerCase()} is now registered.`)
      replyToComment(`Twitter account ${twitter_username.toLowerCase()} was registered to Hive account ${hive_username.toLowerCase()}!`, hive_username.toLowerCase(), twitter_username.toLowerCase())
      start(i+1, list)
    }
  })
}

function replyToComment(message, hive_username, twitter){
  var permlink = makeid(15).toLowerCase()
  var jsonMetadata = JSON.stringify({
          app: `posh-bot`,
          author: 'fbslo'
        })
  let beforeDate = new Date().toISOString().split('.')[0];
  hive.api.getDiscussionsByAuthorBeforeDate(hive_username, null, beforeDate, 1, function(err, blog) {
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
