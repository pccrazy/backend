var crypto      = require('crypto');
var express    = require("express");
var bodyParser = require('body-parser');
require('events').EventEmitter.defaultMaxListeners = Infinity;
var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //support encoded bodies


function decrypt(data){
  var decipher = crypto.createDecipher('aes-128-ecb', "anwarsalim");
  chunks = [];
  chunks.push(decipher.update(new Buffer(data, "base64").toString("binary")));
  chunks.push(decipher.final('binary') );
  var txt = chunks.join("");
  txt = new Buffer(txt, "binary").toString("utf-8");
  return txt;
}

app.post("/",function(req,res){

  // Decrypt
  console.log("the query "+req.body.Query + "   the decrypt   "+decrypt(req.body.Query));
  res.send("done");
});

app.listen(3000);
