const config = require('../config.json')
const hive = require('@hiveio/hive-js')
const con = require('../database.js')

const register = require("./register.js")

hive.config.set('alternative_api_endpoints', ["https://anyx.io", "https://api.hive.blog", "https://api.hivekings.com", "https://api.openhive.network", "hived.privex.io", "rpc.ausbit.dev", "https://hive.roelandp.nl"]);

function processPayment(data){
  let id = randomInteger(0, 1000000)
  let memo = `Please create tweet with this content: "#poshbotregistration ${id}"`
  storeToDatabase(memo, id, data)
}

function storeToDatabase(memo, id, data){
  let values = [[data.from, id, false]]
  con.query("SELECT * FROM users WHERE hive = ?", [data.from], (err1, result1) => {
    if(err1) console.log(`Database error: ${err1}`)
    else {
      if(result1.length == 0){
        con.query("INSERT INTO registration (hive, id, used) VALUES ?", [values], (err, result) => {
          if(err) sendErrorTransfer(data, `There was error while processing your request, please try again later!`)
          else {
            hive.api.getAccounts([data.from], (err, res) => {
              var encoded = hive.memo.encode(config.active_key, res[0].memo_key, `#${memo}`)
              hive.broadcast.transfer(config.active_key, config.account_name, data.from, data.amount, encoded, function(err2, result2) {
                if (err2)  console.log("Error sending confirmation transfer for "+data.from)
                else console.log("Confirmation transfer send to "+data.from)
              });
            });
          }
        })
      } else {
        sendErrorTransfer(data, `Your account is already registered!`)
      }
    }
  })
}

function sendErrorTransfer(data, memo){
  hive.broadcast.transfer(config.active_key, config.account_name, data.from, data.amount, memo, function(err, result) {
    if(err) console.log(`Error sending error transfer: ${err}`)
    else console.log(`Error transfer sent to ${data.from}`)
  });
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

module.exports.processPayment = processPayment
