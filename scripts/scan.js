const config = require('../config.json')
const hive = require('@hiveio/hive-js')
const con = require('../database.js')

const register = require("./register.js")
const register_transfer = require("./register-transfer.js")

hive.config.set('alternative_api_endpoints', ["https://anyx.io", "https://api.hive.blog", "https://api.hivekings.com", "https://api.openhive.network", "hived.privex.io", "rpc.ausbit.dev", "https://hive.roelandp.nl"]);
hive.api.setOptions({ url: 'https://anyx.io' });

module.exports = {
  scan: async function scan(){
    console.log("Starting scanning HIVE blockchain!")
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
                register_transfer.processPayment(data)
              } else if (type == 'comment' && data.parent_permlink == 'register-your-twitter-account' && data.parent_author == 'poshtoken'){
                data.body = data.body.replace(/\n/g, " ");
                if(data.body.split(" ")[0].toLowerCase() == "register" && data.body.split(" ")[1].includes("twitter.com")){
                  register.checkTwitterData(data)
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
      }, 6000)
    }
  }
}
