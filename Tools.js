var exports = module.exports = {};
var httpRequest = require('http_request');

exports.sendSms = function(number) {
  var client = require('twilio')('ACeb686f315944592c283ea4c9945c7180', '2e802e75e0c419ebbcf3f5f9226d9bfb');

  //Send an SMS text message
  client.sendMessage({
      to:number, // Any number Twilio can deliver to
      from: '+14243651986', // A number you bought from Twilio and can use for outbound communication
      body: 'Fire Alert At Your Place' // body of the SMS message
  }, function(err, responseData) { //this function is executed when a response is received from Twilio

      if (!err) { // "err" is an error received during the request, if any


          console.log(responseData); // outputs "+14506667788"
         // outputs "word to your mother."

      }else{

          console.log(err);
      }
  });
};
