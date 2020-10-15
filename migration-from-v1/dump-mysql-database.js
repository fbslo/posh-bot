const con = require('../database.js')
var fs = require('fs')

con.query("SELECT * FROM users", (err, result) => {
  if (err) console.log(err)
  else {
    let users = []
    for (i in result){
      users.push({
        twitterUsername: result[i].twitter,
        twitterTweetId: "v1-legacy",
        hiveUsername: result[i].hive_username,
        timestamp: result[i].time
      })
    }
    users = JSON.stringify(users)
    fs.appendFile('users.txt', users, function (err) {
      if (err) console.log(err)
      else console.log("Done :)")
   })
 }
})
