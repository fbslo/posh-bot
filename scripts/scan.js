const config = require('../config.json')
const hive = require('@hiveio/hive-js')
const con = require('../database.js')

const register = require("./register.js")
const register_transfer = require("./register-transfer.js")
const balance = require("./balance.js")


hive.config.set('alternative_api_endpoints', ["https://anyx.io", "https://api.hive.blog", "https://api.hivekings.com", "https://api.openhive.network", "hived.privex.io", "rpc.ausbit.dev", "https://hive.roelandp.nl"]);
hive.api.setOptions({ url: 'https://anyx.io' });

module.exports = {
  scan: async function scan(){
    console.log("Starting scanning HIVE blockchain!")
    hive.api.getDynamicGlobalProperties(function(err, result) {
      if(err) restart(err)
      else {
        getDataFromBlock(result.head_block_number)
      }
    });

    function getDataFromBlock(blockNum){
      if(blockNum % 100 == 0) displayLag(blockNum)
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
                console.log(`Found one registration transfer: ${data.from}`)
                register_transfer.processPayment(data)
              } else if (type == 'comment' && data.parent_author == 'poshtoken'){
                let body = data.body.replace(/\n/g, " ");
                if(body.split(" ")[0].toLowerCase() == "register" && body.split(" ")[1].includes("twitter.com")){
                  console.log(`Found one registration comment: ${data.body}`)
                  register.checkTwitterData(data)
                }
              } else if (type == 'comment' && (data.parent_author == 'posh-bot' || data.parent_author == 'poshtoken')){
                if(data.body.toLowerCase() == "!balance"){
                  console.log(`Found one !balance comment from ${data.author}`)
                  balance.displayUserBalance(data)
                }
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
      }, 3000)
    }
  }
}

function displayLag(blockNum){
  hive.api.getDynamicGlobalProperties(function(err, result) {
    if(err) console.log("Error getting globalPropertis for lag check...")
    else {
      console.log(`Current head block: ${result.head_block_number}, current scanned block: ${blockNum}, lag: ${result.head_block_number - blockNum}`)
    }
  });
}
