const SlackBot = require('slackbots');
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko()

const config = require("../config.json")
const con = require("../database.js")

const bot = new SlackBot({
    token: config.bot_token
})

async function removeCoins(user, coins_raw, channel){
  var coins = coins_raw.slice(1)
  con.query("SELECT * FROM coins WHERE user = ?", [user], (err, result) => {
    if(err) sendError(err, channel)
    else {
      if(result.length == 0){
        const params = {
          icon_emoji: ":crying_cat_face:",
          username: 'Missing watchlist'
        }
        bot.postMessage(channel, 'You do not have any coins on your watchlist! Please add them with `$add coin-name`!', params);
      } else {
        updateUser(user, coins, channel)
      }
    }
  })
  async function updateUser(user, coins, channel){
    con.query("SELECT coins FROM coins WHERE user = ?", [user], (err, result) => {
      if(err) sendError(err, channel)
      else {
        let db_coins = result[0].coins.split(",")
        let new_coins = db_coins.filter(val => !coins.includes(val)).toString()
        let removed_coins = coins.toString()
        insertUpdate(user, new_coins, channel, removed_coins)
      }
    })
  }
  function insertUpdate(user, coins, channel, removed_coins){
    let sql = "UPDATE coins SET coins = ? WHERE user = ?"
    con.query(sql, [coins.toString(), user], (err, result) => {
      if(err) sendError(err, channel)
      else {
        const params = {
          icon_emoji: ':money_mouth_face:',
          username: 'Coins removed'
        }

        bot.postMessage(
          channel,
          "Coins: "+ removed_coins.replace(/,/g, ', ')+" were removed from your watchlist! Remaining coins: "+coins.replace(/,/g, ', ')+"!",
          params
        );
      }
    })
  }
}

function sendError(error, channel){
  console.log(error)
  const params = {
    icon_url: "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fentries%2Ficons%2Ffacebook%2F000%2F026%2F489%2Fcrying.jpg",
    username: 'Error'
  }

  bot.postMessage(
    channel,
    ':crying_cat_face: Database error!',
    params
  );
}

module.exports.removeCoins = removeCoins
