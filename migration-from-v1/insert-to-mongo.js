const mongo = require("../mongo.js")
const fs = require("fs")
require("dotenv").config()
console.log(process.env.MONGO)
mongo.connect()
  .then(() => main())
  .catch(err => console.log(err))

function main(){
  fs.readFile("./users.txt", (err, result) => {
    if (err) console.log(err)
    else {
      const database = mongo.get().db("Posh").collection("users")
      let users = JSON.parse(result)
      database.insertMany(users, (err, result) => {
        console.log(err, result)
      })
    }
  })
}
