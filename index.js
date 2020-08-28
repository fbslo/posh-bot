var express =  require("express");
var app = express();

const con = require('./database.js')
const config = require("./config.json")

const scan = require("./scripts/scan.js")
const scan_stream = require("./scripts/scan_stream.js")
const search_register_tweets = require("./scripts/search_register_tweets.js")
const search = require("./scripts/search.js")
const score = require("./scripts/score.js")
const tokens = require("./scripts/tokens.js")
const daily = require("./scripts/daily_post.js")

setInterval(() => {
  score.calculate()
}, 1000 * 60 * 30) //every 30 minutes

setInterval(() => {
  tokens.give()
}, 1000 * 60 * 60 * 12) //every 1 day

setInterval(() => {
  daily.post()
}, 1000 * 60 * 60 * 24 + 30000) //every 1 day

search.start()
scan_stream.scan()
search_register_tweets.start()

if(process.env.POST_NOW == 'true'){
  daily.post()
}

app.get('/', (req, res) => {
  con.query("SELECT hive_username, user_name, SUM(points) AS sum FROM twitter_posts GROUP BY hive_username, user_name ORDER BY sum DESC;", (err, result) => {
    if (err) res.status(500).json({error: 500, message: 'Internal Server Error'})
    else {
      let data = []
      for (i in result){
        data.push({hive: result[i].hive_username, twitter: result[i].user_name, tokens: result[i].sum})
      }
      res.status(200).send(data)
    }
  })
})

app.listen(8080)
