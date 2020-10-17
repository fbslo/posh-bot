var Twit = require('twit')
require("dotenv").config()

var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

function verify(id, hiveUsername){
  console.log(id, hiveUsername)
  return new Promise((resolve, reject) => {
    T.get('statuses/show/:id', { id: id }, function(err, data, response) {
      if (err) reject(err)
      else {
        try {
          //register-hive-account-hive-username
          let text = data.text
          let array = data.text.split("-")
          let firstPart = array.slice(0, 3).join("-")
          let secondPart = array.slice(3).join("-")
          if(firstPart.toLowerCase() == 'register-hive-account' && secondPart.toLowerCase() == hiveUsername.toLowerCase()){
            resolve(data)
          } else {
            resolve(false)
          }
        } catch (e) {
          reject(e)
        }
      }
    })
  })
}

module.exports.verify = verify
