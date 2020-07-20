const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');
const _ = require("lodash")
var request = require("request");
const getUrls = require('get-urls');

let frontends = ['hive.blog', 'peakd.com', '3speak.online']

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  bearer_token: config.bearer_token
});

function start(){
  client.get('search/tweets', {q: '#posh'}, function(error, tweets, response) {
    let array = []
     for (i in tweets.statuses){
       console.log(tweets.statuses[i].user.screen_name)
       if(!tweets.statuses[i].retweeted_status){
         if(new Date().getTime() - new Date(tweets.statuses[i].created_at).getTime() < 21600000){ // 6 hours
           array.push(tweets.statuses[i])
         }
       }
     }
     //removePossibleDuplicates(array)
     forAllTweets(array)
  });
}

function forAllTweets(array){
  for (i in array){
    checkIfTweetIncludesLink(array[i], array, i)
  }
}

async function checkIfTweetIncludesLink(data, array, i){
  let links = Array.from(getUrls(data.text));
  let location = []
  let isValidLink = []
  for (l in links){
    request({url: links[l], followRedirect: false}, function(error, response, body) {
      if (response.statusCode >= 300 && response.statusCode < 400) {
        location.push(response.headers.location);
        if(location.length == links.length){
          for(b in location){
            for(k in frontends){
              if(location[b].includes(frontends[k])){
                isValidLink.push(location[b])
              }
            }
          }
          if(isValidLink.length > 0){
            let link = isValidLink[0]
            saveDataToDatabase(array[i], array, i, link)
          } else {
            console.log('Does not include link!')
          }
        }
      }
    });
  }
}

// function removePossibleDuplicates(array){
//   con.query('SELECT id FROM twitter_posts', (err_db, result_db) => {
//     if(err_db) console.log("Error with database: Error: "+err_db)
//     else {
//       let result = []
//       for (i in result_db){
//         result.push({id: result_db[i].id})
//       }
//       let full_array = [...result, ...array]
//
//       const filteredArr = full_array.reduce((acc, current) => {
//         const x = acc.find(item => item.id === current.id);
//         if (!x) {
//           return acc.concat([current]);
//         } else {
//           return acc;
//         }
//       }, []);
//
//       if(filteredArr.length == 0){
//         console.log("No new  posts found!")
//       } else {
//         saveDataToDatabase(array[0], array, 0)
//       }
//     }
//   })
// }

function saveDataToDatabase(data, array, i, link){
  con.query("SELECT * FROM users  WHERE twitter = ?", [data.user.screen_name], (err_users, result_users) => {
    if(err_users) console.log("Error with database: Error: "+err_users)
    else {
      if(result_users.length == 0){
        console.log(`User ${data.user.screen_name} did not register any Hive account!`)
      } else {
        let values = [[data.id_str, new Date(data.created_at).getTime(), data.user.id, data.user.screen_name, result_users[0].hive, link]]
        con.query("INSERT INTO twitter_posts (id, created_at, user_id, user_name, hive_username, hive_link) VALUES ?", [values], (err, result) => {
          if(err) console.log("Error with database: Error: "+err)
          else {
            console.log("Tweet stored!")
          }
        })
       }
    }
  })
}

module.exports.start = start
