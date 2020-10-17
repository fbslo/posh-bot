const { Hive } = require('@splinterlands/hive-interface');
const hive = new Hive();

function start(callback){
  try {
   hive.stream({
     on_block: onBlock
   });
   function onBlock(block_num, block){
     for (const transaction of block.transactions) {
       for (const op of transaction.operations){
         let type = op[0]
         let data = op[1]
         if (type = 'comment' && (data.parent_author == 'posh-bot' || data.parent_author == 'poshtoken') && data.body.split(" ")[0].toLowerCase() == 'register'){
           //register https://twitter.com/username/status/tweetId
           try {
             data.body = data.body.replace(/(\r\n|\n|\r)/gm, ""); // remove line breaks
             let twitterLink = data.body.split(" ")[1]
             let twitterUsername = twitterLink.split("/")[3] //[ "https:", "", "twitter.com", "username", "status", "tweetId" ]
             let twitterTweetId = twitterLink.split("/")[5]
             twitterTweetId.replace(/[^0-9]/g, "") //remove possible ?query from link
             let returnObject = {
               isSuccess: true,
               hiveUsername: data.author,
               hiveCommentPermlink: data.permlink,
               twitterUsername: twitterUsername,
               twitterTweetId: twitterTweetId
             }
             callback(returnObject)
           } catch (e) {
             let returnObject = {
               isSuccess: false,
               error: e,
               hiveUsername: data.author,
               hiveCommentPermlink: data.permlink
             }
             callback(returnObject)
           }
         }
       }
     }
   }
 } catch (e) {
   setTimeout(() => {
     start()
   }, 3000)
 }
}

module.exports.start = start
