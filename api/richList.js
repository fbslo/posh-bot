const express = require('express')
const router = express.Router()
const mongo = require("../mongo.js")
const database = mongo.get().db("Posh").collection("tweets")

router.get("/", async (req, res) => {
  let result  = await database.aggregate([
    // Group by the grouping key, but keep the valid values
    { "$group": {
        "_id": "$hiveUsername",
        "tokens": { $sum: "$tokens" },
    }},
    { "$sort": { "tokens": -1 } }
  ]).toArray()
  let response = []
  for (i in result){
    response.push({
      hiveUsername: result[i]._id,
      tokens: result[i].tokens
    })
  }
  res.json({result: response})
})

module.exports = router;
