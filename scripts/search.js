const con = require('../database.js')
const config = require("../config.json")
var Twitter = require('twitter');
const _ = require("lodash")
var request = require("request");
const getUrls = require('get-urls');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});



function start(){ //REST API is returning only limited amount of results!
  var stream = client.stream('statuses/filter', {track: '#posh', tweet_mode: 'extended'});
  stream.on('data', function(event) {
    if(new Date().getTime() - new Date(event.created_at).getTime() < 21600000){ // 6 hours
      forAllTweets(event)
    }
  });

  stream.on('error', function(error) {
    console.log("Error getting Tweets from API: "+ error)
    throw error;
  });
}

function forAllTweets(data){
  checkIfTweetIncludesLink(data, (result, link) => {
    if(result == true){
      saveDataToDatabase(data, link)
    } else {
      console.log(`Tweet ${data.user.screen_name}/status/${data.id_str} does not include any Hive link!`)
    }
  })
}

async function checkIfTweetIncludesLink(data, callback){
  let urls = Array.from(getUrls(data.text));
  if(urls.length > 0){
    includesLink(urls, (isLink, link) => {
      if(isLink == true){
        callback(true, link)
      } else {
        callback(false, null)
      }
    })
  } else {
    callback(false, null)
  }
}

function includesLink(urls, callback){
  var i = 0
  let isValidLink = []
  searchLink(urls, i)
  function searchLink(urls, i){
    request({url: urls[i], followRedirect: false}, function(error, response, body) {
      if(error) console.log("Error fetching url: "+error)
      else {
        if (response.statusCode >= 300 && response.statusCode < 400) {
          if(response.headers.location.includes("peakd") || response.headers.location.includes("hive.blog") || response.headers.location.includes("3speak.online")){
            isValidLink.push(response.headers.location)
          }
          if(i < urls.length-1){
            if(isValidLink.length > 0) callback(true, isValidLink[0])
            else {
              i++
              searchLink(urls, i)
            }
          } else {
            if(isValidLink.length > 0) callback(true, isValidLink[0])
            else callback(false, null)
          }
        } else  {
          if(i <= urls.length-1){
            i++
            searchLink(urls, i)
          } else {
            if(isValidLink.length > 0) callback(true, isValidLink[0])
            else callback(false, null)
          }
        }
      }
    })
  }

    //
    // if(i == links.length){
    //   if(isValidLink.length > 0){
    //     let link = isValidLink[0]
    //     console.log(`${data.user.screen_name}/${data.id_str} include link!`)
    //     callback(true)
    //   } else {
    //     console.log(`Does from ${data.user.screen_name}/status/${data.id_str} not include link!`)
    //   }
    // }
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

function saveDataToDatabase(data, link){
  con.query("SELECT * FROM users  WHERE twitter = ?", [data.user.screen_name], (err_users, result_users) => {
    if(err_users) console.log("Error with database: Error: "+err_users)
    else {
      if(result_users.length == 0){
        console.log(`User ${data.user.screen_name} did not register any Hive account!`)
        //remove after launch
        let values = [[data.id_str, new Date(data.created_at).getTime(), data.user.id, data.user.screen_name, 'null', link]]
        con.query("INSERT INTO twitter_posts (id, created_at, user_id, user_name, hive_username, hive_link) VALUES ?", [values], (err, result) => {
          if(err) console.log("Error with database: Error: "+err)
          else {
            console.log("Tweet stored!")
          }
        })
        //end
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
