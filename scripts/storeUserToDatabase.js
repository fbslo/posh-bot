const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("users")

function isUserAlreadyStored(twitterUsername, hiveUsername){
  return new Promise((resolve, reject) => {
    database.findOne({$or: [{twitterUsername: twitterUsername}, {hiveUsername: hiveUsername}]}, (err, result) => {
      if (err) reject(err)
      else {
        if (result == null) resolve("user_not_stored")
        else resolve("user_stored")
      }
    })
  })
}

function storeUser(registrationData){
  return new Promise((resolve, reject) => {
    let { twitterUsername, twitterTweetId, hiveUsername } = registrationData
    let dataObject = {
      twitterUsername: twitterUsername.toLowerCase(),
      twitterTweetId: twitterTweetId,
      hiveUsername: hiveUsername,
      timestamp: new Date().getTime()
    }
    database.insertOne(dataObject, (err, result) => {
      if (err) reject(err)
      else resolve("user_stored")
    })
  })
}

module.exports.isUserAlreadyStored = isUserAlreadyStored
module.exports.storeUser = storeUser
