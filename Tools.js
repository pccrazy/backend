var exports = module.exports = {};
var httpRequest = require('http_request');
var GCM = require('gcm').GCM;
var apiKey = 'AIzaSyAsiIF28h2ZONBE7hdsrjekkhICn3x49yY';
var gcm = new GCM(apiKey);
var request = require('request');


  exports.sendtoRas=function(pinn,modee){

    request.post({url:'http://10.8.0.6:4000/gpio', form: {pin:pinn,mode:modee}},
    function(err,httpResponse,body)
      {
            return httpResponse;
      });

    }
    exports.sendJobtoRas=function(job,dstatus){

      request.post({url:'http://10.8.0.6:4000/job', form: {job:job,dstatus:dstatus}},
      function(err,httpResponse,body)
        {
          return httpResponse;
        });

      }

exports.sendEmail=function(email){
//  console.log(email);
  var api_key = 'key-c8f8793557c5af804326747e4ba86ad7';
  var domain = 'sandboxcb76aaa8d6f7404f94ef3055c52f854a.mailgun.org';
  var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
  var data = {
    from: 'mailgun@sandboxcb76aaa8d6f7404f94ef3055c52f854a.mailgun.org',
    to:email,
    subject: 'Fire Alert',
    text: 'Be Aware The System Detected Fire'
  };

  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
}


exports.pushNotification=function(id){
  var message = {
      registration_id: id, // required
      'data.title': 'Alert Fire At Home',
  };
  gcm.send(message, function(err, messageId){
      if (err) {
          console.log("Something has gone wrong!"+err);
      } else {
          console.log("Sent with message ID: ", messageId);
      }
  });

}
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
exports.getseason=function(){
  var d = new Date();
  var n = d.getMonth();
  var season;
  if(n==1||n==2||n==3){
    season="winter"
  }else if(n==4||n==5||n==6){
      season="spring"
  }else if (n==7||n==8||n==9) {
      season="summer"
  }else if (n==7||n==8||n==9) {
      season="autumn"
  }
  return season;
}
