const config = require('../config.json')
const hive = require('@hiveio/hive-js')
const con = require('../database.js')

hive.config.set('alternative_api_endpoints', ["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network", "hived.privex.io", "rpc.ausbit.dev", "https://hive.roelandp.nl"]);

module.exports = {
  scan: async function scan(){
    hive.api.getDynamicGlobalProperties(function(err, result) {
      if(err) restart()
      else {
        getDataFromBlock(result.head_block_number)
      }
    });

    function getDataFromBlock(blockNum){
      hive.api.getBlock(blockNum, function(err, result) {
        if(err){
          restart(err)
        } else {
          if(result && result != null){
            let time = result.timestamp
            for(i in result.transactions){
              let type = result.transactions[i].operations[0][0]
              var data = result.transactions[i].operations[0][1]
              if(type == 'transfer' && data.to == config.account_name){
                processPayment(data)
              }
            }
          }
        }
        setTimeout(() => {
          getDataFromBlock(blockNum + 1)
        }, 3000)
      });
    }

    function restart(err){
      console.log("Error scanning HIVE blockchain: "+err)
      setTimeout(() => {
        scan()
      }, 6000)
    }
  }
}

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
              hive.broadcast.transfer(config.active_key, config.account_name, data.from, data.amount, encoded, function(err, result) {
                console.log(err, result);
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
