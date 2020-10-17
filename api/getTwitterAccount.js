const express = require('express')
const router = express.Router()
const Twit = require('twit')

var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})


router.get("/:username", (req, res) => {
  if (!req.params.username) res.json({error: "missing_twitter_username"})
  let username = req.params.username
  T.get('users/show', { screen_name: username }, (err, result) => {
     if (err && err.code == 50) res.json({error: 'twitter_user_not_found'})
     else if (err) res.json({error: 'twitter_internal_server_err'})
     else res.json({error: null, response: result})
  })
})

router.get("/getTimeline/:username", (req, res) => {
  if (!req.params.username) res.json({error: "missing_twitter_username"})
  let username = req.params.username
  T.get('statuses/user_timeline', { screen_name: username, count: 5 }, (err, result) => {
     if (err && err.code == 50) res.json({error: 'twitter_user_not_found'})
     else if (err) res.json({error: 'twitter_internal_server_err'})
     else res.json({error: null, response: result})
  })
})

module.exports = router;
