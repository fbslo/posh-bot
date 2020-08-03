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
    start()

    function start(){
      console.log("Starting scanning HIVE blockchain!")
      hive.api.streamTransactions('head', function(err, result) {
        if(err) restart(err)
        let type = result.operations[0][0]
        let data = result.operations[0][1]
        if(type == 'transfer' && data.to == config.account_name){
          console.log(`Found one registration transfer: ${data.from}`)
          register_transfer.processPayment(data)
        } else if (type == 'comment' && data.parent_permlink == 'register-your-twitter-account' && data.parent_author == 'poshtoken'){
          data.body = data.body.replace(/\n/g, " ");
          console.log(`Found one registration comment: ${data.body}`)
          if(data.body.split(" ")[0].toLowerCase() == "register" && data.body.split(" ")[1].includes("twitter.com")){
            register.checkTwitterData(data)
          }
        } else if (type == 'comment' && (data.parent_author == 'posh-bot' || data.parent_author == 'posh-bot')){
          if(data.body.toLowerCase() == "!balance"){
            balance.displayUserBalance(data)
          }
        }
      });
    }

    function restart(err){
      setTimeout(() => {
        console.log("Error scanning HIVE: "+err)
        start()
      }, 3000)
    }
  }
}
