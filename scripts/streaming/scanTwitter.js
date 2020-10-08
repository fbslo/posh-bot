var Twit = require('twit')

var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})


function stream(callback){
  var stream = T.stream('statuses/filter', { track: process.env.HASHTAG })

  stream.on('tweet', function (tweet) {
    console.log(callback(tweet))
  })

  stream.on('error', (err) => {
    console.log("Error streaming Twitter: ", err)
    stream()
  })

  stream.on('end', (err) => {
    console.log("Error (end) streaming Twitter: ", err)
    stream()
  })
}

module.exports.stream = stream
