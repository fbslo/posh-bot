const hive = require("@hiveio/hive-js")

function reply(message, registrationData){
  let permlink = new Date().getTime() + '-posh-bot'
  hive.broadcast.comment(process.env.PRIVATE_KEY, registrationData.hiveUsername, registrationData.hiveCommentPermlink, process.env.ACCOUNT, permlink, '', message, '', function(err, result) {
    if (err) console.log(err)
    else addCommentOptions(permlink)
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
    if (err) console.log(`Error while setting comment options: ${err}`)
  });
}

module.exports.reply = reply
