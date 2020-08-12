const got = require('got')
const hive = require('@hiveio/hive-js')

async function getHiveScore(data, callback){
  try {
    if(data.hive_link.includes("3speak.online")){
      if(data.hive_link.split("=")[1].split("/")[0].split('&')[0] == data.hive_username){
        getPostEngagement(data.hive_username, data.hive_link.split("@")[1].split("/")[1], data, (holders) => {
          callback(holders.length * 5)
        })
      } else {
        callback(0)
      }
    } else if(data.hive_link.includes('hive.blog') || data.hive_link.includes('peakd') || data.hive_link.includes("leofinance.io")){
      if(data.hive_link.split("@")[1].split("/")[0] == data.hive_username){
        getPostEngagement(data.hive_username, data.hive_link.split("@")[1].split("/")[1], data, (holders) => {
          callback(holders.length * 5)
        })
      } else {
        callback(0)
      }
    } else {
      callback(0)
    }
  } catch (e) {
    console.log("Error while getting Hive enagagement data. Details: "+e)
    callback(0)
  }
}

async function getPostEngagement(author, permlink, data, callback){
  try {
    hive.api.getContentReplies(author, permlink, async function(err, result) {
      if(err){
        console.log(`Error getting post ${author}/${permlink}! Error: ${err}`)
        callback([])
      }
      else {
        let holders = []
        async function checkHolders(result, i){
          let isHolder = await isEngageHolder(result[i].author)
          if(isHolder == true){
            holders.push(result[i].author)
          }
          i++
          if(i != result.length-1){
            checkHolders(result, i)
          } else {
            callback(holders)
          }
        }
        checkHolders(result, 0)
      }
    });
  } catch (e) {
    console.log("Error while getting Hive engagement. Details: "+e)
    callback([]) //return empty string
  }
}

async function isEngageHolder(user){
  try {
    let isEngageHolder = []
    var response = await got('https://accounts.hive-engine.com/accountHistory?account='+user)
    let data = JSON.parse(response.body)
    for (i in data){
      if(data[i].symbol == "ENGAGE"){
        isEngageHolder.push(true)
      }
    }
    if(isEngageHolder.length > 0){
      return true
    } else {
      return false
    }
  } catch (e) {
    console.log("Error while getting ENGAGE details. Details: "+e)
    return false
  }
}

module.exports.getHiveScore = getHiveScore
