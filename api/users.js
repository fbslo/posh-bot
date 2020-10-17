const express = require('express')
const router = express.Router()
const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("users")

router.get("/", async (req, res) => {
  let result  = await database.find({}).toArray()
  let response = []
  for (i in result){
    response.push({
      hiveUsername: result[i].hiveUsername,
      twitterUsername: result[i].twitterUsername,
      registrationTime: new Date(result[i].timestamp)
    })
  }
  res.json({result: response})
})

module.exports = router;
