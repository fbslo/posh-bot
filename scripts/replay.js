const hive = require('@hiveio/hive-js')
const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  bearer_token: config.bearer_token
});

hive.config.set('alternative_api_endpoints', ["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network", "hived.privex.io", "rpc.ausbit.dev", "https://hive.roelandp.nl"]);

replayBlocks(45560491)


async function replayBlocks(start_block){
  hive.api.getBlock(start_block, async function(err, result) {
    if(err){
      console.log('Error scanning blockchain: Block '+ start_block+", error: "+err)
      setTimeout(() => {
        replayBlocks(start_block)
      }, 1000)
    } else {
      if(result && result != null){
        console.log(`Scanning block ${start_block}`)
        let time = result.timestamp
        for(i in result.transactions){
          let type = result.transactions[i].operations[0][0]
          let data = result.transactions[i].operations[0][1]
          if (type == 'comment' && IsJsonString(data.json_metadata) && data.parent_permlink == 'register-your-twitter-account'){
            if(data.body.split(" ")[0].toLowerCase() == "register" && data.body.split(" ")[1].includes("twitter.com")){
              console.log("Check if it's already registered!")
              isAlreadyRegistred(data)
            }
          } else if(type == 'transfer' && data.to == config.account_name){

            processPayment(data)

            function processPayment(data){
              let id = randomInteger(0, 1000000)
              let memo = `Please create tweet with this content: "#poshbotregistration ${id}"`
              storeToDatabase(memo, id, data)
            }

            function storeToDatabase(memo, id, data){
              let values = [[data.from, id, false]]
              con.query("SELECT * FROM users WHERE hive = ?", [data.from], (err1, result1) => {
                if(err1) console.log(`Database error: ${err1}`)
                else {
                  if(result1.length == 0){
                    con.query("INSERT INTO registration (hive, id, used) VALUES ?", [values], (err, result) => {
                      if(err) sendErrorTransfer(data, `There was error while processing your request, please try again later!`)
                      else {
                        hive.api.getAccounts([data.from], (err, res) => {
                          var encoded = hive.memo.encode(config.active_key, res[0].memo_key, `#${memo}`)
                          hive.broadcast.transfer(config.active_key, config.account_name, data.from, data.amount, encoded, function(err, result) {
                            console.log(err, result);
                          });
                        });
                      }
                    })
                  } else {
                    sendErrorTransfer(data, `Your account is already registered!`)
                  }
                }
              })
            }

            function sendErrorTransfer(data, memo){
              hive.broadcast.transfer(config.active_key, config.account_name, data.from, data.amount, memo, function(err, result) {
                if(err) console.log(`Error sending error transfer: ${err}`)
                else console.log(`Error transfer sent to ${data.from}`)
              });
            }

            function randomInteger(min, max) {
              return Math.floor(Math.random() * (max - min + 1)) + min;
            }
          } else if(i == result.transactions-1){
            nextBlock(start_block)
          }
        }
      } else {
        console.log('Error scanning blockchain: Block '+ start_block)
        setTimeout(() => {
          nextBlock(start_block)
        }, 1000)
      }
    }
  });
}

function isAlreadyRegistred(data){
  console.log("isAlreadyRegistred")
  let tweet = data.body.split(" ")
  let id = tweet[1].split("/")[5].split("?")[0]
  let twitter_account = tweet[1].split("/")[3].toLowerCase()
  con.query("SELECT * FROM users WHERE hive = ? OR twitter = ?;", [data.author, twitter_account], (err, result) => {
    if(err) console.log(err)
    else {
      if(result.length == 0){
        console.log("Check the tweet!")
        client.get('statuses/show/'+id, function(error, tweets, response) {
           if(error) console.log("Error getting Twitter API data! Error: "+error)
           else if(tweets.text){
             if(tweets.text.includes("register-hive-account")){
               let tweet_split = tweets.text//.split("-")
               console.log(tweet_split.substring(22), data.author)
               if(tweet_split.substring(22) == data.author){
                 completeRegistration(data, twitter_account)
               } else {
                 console.log("Username do not match")
               }
             }
           }
        });
      } else {
        console.log(`Account ${data.author} or ${twitter_account} is already registered.`)
      }
    }
  })
}

function completeRegistration(twitter, data){
  con.query('SELECT * FROM users WHERE hive = ? OR twitter = ?', [data.author, twitter], (err, result) => {
    if(err) console.log(err)
    else {
      if (result.length == 0){
        let values = [[data.author, twitter, new Date().getTime(), new Date()]]
        con.query("INSERT INTO users (hive, twitter, time, human_time) VALUES ?", [values], (err, result) => {
          if(err) console.log(err)
          else{
            console.log(`Hive user ${data.author} with Twitter username ${twitter} is now registered.`)
            replyToComment(`Twitter account ${twitter} was registered to Hive account ${data.author}!`, data, twitter)
          }
        })
      } else {
        console.log(`Hive user ${data.author} or Twitter account ${twitter} is already registered`)
        replyToComment(`Hive user ${data.author} or Twitter account ${twitter} is already registered`, data, twitter)
      }
    }
  })
}



async function replyToComment(message, data, twitter){
  hive.api.getContentReplies(data.author, data.permlink, function(err, result) {
    if(err) console.log("Error getting new registrations! Error: "+err)
    else {
      if(result.length == 0) reply(message, data, twitter)
      else {
        let isAccountRegistred = []
        for(i in result){
          if(result[i].author == 'poshtoken'){
            isAccountRegistred.poush(true)
          }
        }
        if(isAccountRegistred.length == 0) reply(message, data, twitter)
        else console.log("Comment already there")
      }
    }
  })

}

function reply(message, data, twitter){
  let permlink = makeid(10).toLowerCase()
  let jsonMetadata = JSON.stringify({
          app: `posh-bot`,
          author: 'fbslo'
        })
  hive.broadcast.comment(config.posting_key, data.author, data.permlink, config.account_name, permlink, '', message, jsonMetadata, function(err, result) {
    if(err){
      console.log('Error posting comment! Error: '+err)
    }
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

function nextBlock(start_block){
  start_block = Number(start_block) + 1
  replayBlocks(start_block)
}


function IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}
