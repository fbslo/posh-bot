const con = require('../database.js')
const config = require("../config.json")
const hive = require('@hiveio/hive-js')


function displayUserBalance(data){
  con.query(`SELECT hive_username, user_name, SUM(points) AS sum FROM twitter_posts WHERE hive_username = ?;`, [data.author], (err, result) => { //points_time <= ${one_day}
    if(err) console.log("Error with database  for balance: Error: "+err)
    else {
      submitHiveComment(result, data)
    }
  })
}

async function submitHiveComment(data, hive_data){
  var jsonMetadata = JSON.stringify({
    app: `posh-bot`,
    author: 'fbslo'
  })
  let permlink = makeid(15).toLowerCase()
  let body;
  if(data.length == 0){
    body = 'You do not have any points. Are you  sure you are registered and have submited ant #hive tweets?'
  } else {
    body = `Balance for @${data[0].hive_username} (${data[0].user_name} on Twitter) is: ${data[0].sum}`
  }
  hive.broadcast.comment(config.posting_key, hive_data.author, hive_data.permlink, config.account_name, permlink, 'Balance!', body, jsonMetadata, function(err, result) {
    if(err) console.log('Balance comment failed! Err: '+err)
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
            console.log(`Balance comment submited!`)
      //     }
      //   }
      // );
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

module.exports.displayUserBalance = displayUserBalance
