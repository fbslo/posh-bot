const getUrls = require('get-urls');
const request = require("request");

function check(data){
  return new Promise((resolve, reject) =>  {
    let urls;
    if(data.extended_tweet){
      urls = Array.from(getUrls(data.extended_tweet.full_text));
    } else {
      urls = Array.from(getUrls(data.text));
    }
    if(urls.length > 0){
      includesLink(urls, (isLink, link) => {
        if (isLink == false) resolve(false)
        else {
          resolve(link)
        }
      })
    } else {
      resolve(false)
    }
  })
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
          if(
            response.headers.location.includes("peakd") ||
            response.headers.location.includes("hive.blog") ||
            response.headers.location.includes("3speak.online") ||
            response.headers.location.includes("leofinance.io")
          ){
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
}

module.exports.check = check
