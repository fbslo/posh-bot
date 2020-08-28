const con = require('../database.js')
const config = require("../config.json")
const hive = require('@hiveio/hive-js')


function post(){
  var one_day = new Date().getTime() - 86400000
  var now = new Date().getTime()
  con.query(`SELECT hive_username, user_name, SUM(points) AS sum FROM twitter_posts WHERE points_time BETWEEN ${one_day} AND ${now} GROUP BY hive_username, user_name ORDER BY sum DESC;`, (err, result) => { //points_time <= ${one_day}
    if(err) console.log("Error with database: Error: "+err)
    else {
      one_day = new Date(one_day) + ''
      now = new Date(now) + ''
      submitHivePost(result, one_day, now)
    }
  })
}

async function submitHivePost(data, one_day, now){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  var jsonMetadata = JSON.stringify({
          app: `posh-bot`,
          author: 'fbslo'
        })
  let permlink = makeid(15).toLowerCase()
  if(data.length == 0){
    console.log('empty')
    // hive.broadcast.comment(config.posting_key, '', 'posh', config.account_name, permlink, 'Daily #POSH stats! '+today, `No new #POSH tweets received tokens today :(\nTweets that were created between ${one_day.split('(')[0]} and ${now.split('(')[0]}`, jsonMetadata, function(err, result) {
    //   if(err) console.log('Daily post failed! Err: '+err)
    //   else console.log('Daily (EMPTY) post submited!')
    // });
  } else {
    richlist(async (rich, one_day, now) => {
      let body = await prepareBody(data, one_day, now)
      body += `\n\n<center><h3>Top 50 earners</h3></center>\n\n|Hive username|Twitter username|Tokens earned|\n|---|---|---|\n`+rich
      hive.broadcast.comment(config.posting_key, '', 'posh', config.account_name, permlink, 'Daily #POSH stats! '+today, body, jsonMetadata, function(err, result) {
        if(err) console.log('Daily post failed! Err: '+err)
        else {
          // hive.broadcast.commentOptions(config.posting_key, config.account_name, permlink, 1000000.000, 10000, true, true,
          //   [[0, {
          //       "beneficiaries": [
          //           {
          //               "account": "fbslo",
          //               "weight": 10000
          //           }
          //       ]
          //   }]],
          //   function (err, result) {
          //     if(err){
          //       console.log('Failure! ' + err);
          //     } else {
                console.log(`Post was posted!`)
          //     }
          //   }
          // );
        }
      });
    })
  }
}

function prepareBody(data, one_day, now){
  let body = `<center><h3>Total number of tokens distributed today: 1,000</h3></center>\nTweets that were created between ${one_day.split('(')[0]} and ${now.split('(')[0]} \n\n|Hive username|Twitter username|Tokens earned today|\n|---|---|---|\n`
  for (i in data){
    body += `|@${data[i].hive_username}|${data[i].user_name}|${data[i].sum}|\n`
    updatePost(data[i].id)
  }
  return body;
}

function richlist(callback){
  con.query(`SELECT hive_username, user_name, SUM(points) AS sum FROM twitter_posts WHERE points_time > 0 GROUP BY hive_username, user_name ORDER BY sum DESC LIMIT 50;`, (err, result) => {
    if(err) callback('Server error!')
    else {
      let body = ''
      for (i in result){
        body += `|@${result[i].hive_username}|${result[i].user_name}|${result[i].sum}|\n`
      }
      callback(body)
    }
  })
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

function updatePost(id){
  con.query("UPDATE twitter_posts SET posted = 'true' WHERE id = ?", [id], (err, result) => {
    if(err) console.log("Database update for posted: "+id+" failed!")
  })
}


module.exports.post = post
