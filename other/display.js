const con = require('../database.js')

con.query("SELECT * FROM users", (err, result) => {
  for (i in result){
    console.log(`@${result[i].hive} | [${result[i].twitter}](https://twitter.com/${result[i].twitter})`)
  }
})
