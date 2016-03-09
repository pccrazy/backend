 var mysql      = require('mysql');
 var express    = require("express");
 var bodyParser = require('body-parser');
 var fs = require('fs');
 require('events').EventEmitter.defaultMaxListeners = Infinity;
 var app = express();
 app.use(bodyParser.json()); // support json encoded bodies
 app.use(bodyParser.urlencoded({ extended: true })); //support encoded bodies




 var pool      =    mysql.createPool({
   connectionLimit : 300, //important
   host     : '173.194.237.126',
   user     : 'pccrazy07',
   password : '12j1145',
   database : 'SmartHouse',
   debug    :  false,
   ssl  : {
   ca : fs.readFileSync(__dirname + '/server-ca.pem')
 }
 });

 function handle_database(req,res) {

    // get connection then release if error
     pool.getConnection(function(err,connection){
         if (err) {
           connection.release();
           res.json({"code" : 100, "status" : "Error in connection database"});
           return;
         }
         console.log('connected as id ' + connection.threadId);


         // do the query then release connectoin
         var currenttemp="SELECT AVG(cTemp) FROM Temp JOIN Users USING(idUsers) where userName='anwar' and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";

         connection.query(currenttemp,function(err,rows){
             connection.release();
             if(!err) {
                 console.log(rows);
                 res.json(rows);
             }
         });

         // listener in case of error in the connection
         connection.on('error', function(err) {
               res.json({"code" : 100, "status" : "Error in connection database"});
               return;
         });
   });
 }


 app.post("/query",function(req,res){
      console.log(req.body.Query);
         handle_database(req,res);
 });
 app.get("/temp",function(req,res){
      console.log(req.body.Query);
         handle_database(req,res);
 });
 app.listen(3000);
