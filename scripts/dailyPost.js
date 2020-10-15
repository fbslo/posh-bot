const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")
const hive = require("@hiveio/hive-js")

/* objectOfData:
* tokensPerScore [int]
* tweetsToday [array]
*/

async function submit(objectOfData){
  let { tokensPerScore, tweetsToday } = objectOfData
  let today = getDate();
  let title = `Daily PoshToken statistic - ${today}`
  let body = `Today, we distibuted ${process.env.DAILY_TOKENS} to ${tweetsToday.length} tweets.`
  body += `\nTweets that received tokens between ${new Date()} and ${new Date()} \n\n|Hive username|Tokens earned today|\n|---|---|\n`
  body += prepareTable()
  body += `\n\n<center><h3>Top 25 earners</h3></center>\n\n|Hive username|Tokens earned|\n|---|---|\n`
  body += await prepareRichlist()
  submitToHive(body, title)
}

function submitToHive(body, title){
  let permlink = new Date().getTime() + '-posh-bot'
  let jsonMetadata = { app: 'poshtoken/2.0', author: "fbslo" }
  hive.broadcast.comment(process.env.PRIVATE_KEY, '', 'poshtoken', process.env.ACCOUNT, permlink, title, body, jsonMetadata, function(err, result) {
    if (err) console.log(err)
    //else addCommentOptions(permlink)
  });
}

function addCommentOptions(permlink){
  let extensions = [[0, {
    "beneficiaries": [
      {
        "account": "fbslo",
        "weight": 10000
      }
    ]
  }]]
  hive.broadcast.commentOptions(process.env.PRIVATE_KEY, process.env.ACCOUNT, permlink, '1000.000 HBD', 10000, true, true, extensions, function(err, result) {
    if (err) console.log(err)
  });
}

function prepareTable(tweetsToday){
  let body = ''
  for (i in tweetsToday){
    body += `|@${tweetsToday[i].hiveUsername}|${tweetsToday[i].tokens}|\n`
  }
  return body;
}

function prepareRichlist(){
  return new Promise((resolve, reject) => {
    databse.aggregate({ $match: { tokens: { $ne: [NULL] } } }, { $group: { hiveUsername: hiveUsername, sum : { $sum: "tokens" } } }, (err, result) => {
      if (err) resolve('database_error')
      else {
        if (result != null){
          for (i in result){
            body += `|@${result[i].hiveUsername}|${result[i].sum}|\n`
          }
          resolve(body)
        }
      }
    })
  })
}

function getDate(){
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  return today;
}

module.exports.submit = submit
