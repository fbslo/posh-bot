const con = require('../database.js')
const config = require("../config.json")
const hive = require('@hiveio/hive-js')


function post(){
  //let one_day = new Date().getTime() - 86400000
  con.query(`SELECT * FROM twitter_posts WHERE points_time IS NOT NULL AND posted IS NULL;`, (err, result) => { //points_time <= ${one_day}
    if(err) console.log("Error with database: Error: "+err)
    else {
      submitHivePost(result)
    }
  })
}

async function submitHivePost(data){
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
    hive.broadcast.comment(config.posting_key, '', 'posh', config.account_name, permlink, 'Daily #POSH stats! '+today, 'No new #POSH tweets today :(', jsonMetadata, function(err, result) {
      if(err) console.log('Daily post failed! Err: '+err)
      else console.log('Daily (EMPTY) post submited!')
    });
  } else {
    let body = await prepareBody(data)
    hive.broadcast.comment(config.posting_key, '', 'posh', config.account_name, permlink, 'Daily #POSH stats! '+today, body, jsonMetadata, function(err, result) {
      if(err) console.log('Daily post failed! Err: '+err)
      else console.log('Daily post submited!')
    });
  }
}

function prepareBody(data){
  let body = 'Total number of tokens distributed today: 1,000\n\n'
  for (i in data){
    body += `Hive user @${data[i].hive_username} posted as [@${data[i].user_name}](https://twitter.com/${data[i].user_name}) on Twitter and received ${data[i].points} tokens for this [Tweet](https://twitter.com/${data[i].user_name}/status/${data[i].id}) <br>`
    updatePost(data[i].id)
  }
  return body;
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
