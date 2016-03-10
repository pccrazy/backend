 var mysql      = require('mysql');
 var express    = require("express");
 var bodyParser = require('body-parser');
 var randomstring = require("randomstring");
 var pushbots = require('pushbots');
 var Pushbots = new pushbots.api({
     id:'56daa80a177959ec588b4567',
     secret:'071f98d951458fd7064b4c5d5939a691'
 });
//require('events').EventEmitter.defaultMaxListeners = Infinity;
 var app = express();
 app.use(bodyParser.json()); // support json encoded bodies
 app.use(bodyParser.urlencoded({ extended: true })); //support encoded bodies

 var pool      =    mysql.createPool({
   connectionLimit : 300, //important
   host     : 'evcenterdbnew.cbgvwlnpk0gj.us-east-1.rds.amazonaws.com',
   user     : 'root',
   password : 'iaminlovewithaws',
   database : 'SmartHouse',
   debug    :  false,
   multipleStatements: true
 });


 function handle_database(req,res,Query) {

    // get connection then release if error
     pool.getConnection(function(err,connection){
         if (err) {
           //connection.release();
           res.json({"code" : 100, "status" : "Error in connection database"});
           return;
         }
         console.log('connected as id ' + connection.threadId);


         // do the query then release connectoin
         connection.query(Query,function(err,rows){
             connection.release();
             if(!err) {
                 console.log(rows.length);
                 res.json(rows);
             }else{
               res.json({"code" : 102, "status" : "Error in user"});
             }
         });

         // listener in case of error in the connection
         connection.on('error', function(err) {
               res.json({"code" : 100, "status" : "Error in connection database"});
               return;
         });
   });
 }
 app.post("/createJob",function(req,respond){
   var devicesmode="INSERT INTO `SmartHouse`.`Secdualer` (`idUser`, `Job`, `DeviceStatus`) VALUES ('"+req.body.user+"', '"+req.body.job+"', '"+req.body.deviceStatus+"')";
   pool.query(devicesmode,function(err,res){
   if(err) {
         respond.send("Error");
          console.log("Error"+err);
         }else{
              respond.send("Last insert ID: " +res.insertId);
              console.log('Last insert ID:', res.insertId);
          }
   });
 });
 app.post("/jobs",function(req,respond){
   var devicesmode="SELECT * FROM SmartHouse.Secdualer Where idUser="+req.body.user+" and done='false'";
   handle_database(req,respond,devicesmode);
 });
 app.post("/updatejob",function(req,respond){
   var devicesmode="UPDATE `SmartHouse`.`Secdualer` SET `done`='true' WHERE `idSecdualer`="+req.body.id;
   handle_database(req,respond,devicesmode);
 });
 app.post("/auth",function(req,respond){
   var devicesmode="SELECT idUsers as ID FROM Users where userName='"+req.body.user+"' and Pass='"+req.body.pass+"' and QR='"+req.body.qr+"'";
   handle_database(req,respond,devicesmode);
 });

app.post("/recieve",function(req,respond){
  var devicesmode="SELECT Device_Mode as dMode From SmartHouse.Devices WHERE idUsers="+req.body.user+" Order BY Device_Name Asc"
  handle_database(req,respond,devicesmode);
});
 app.post("/settemp",function(req,ress){
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
      if(req.body.temp>0.0){
      var temp="INSERT INTO `SmartHouse`.`Temp` (`cTemp`, `idUsers`, `Season`) VALUES ("+req.body.temp+","+req.body.user+",'"+season+"')";
      var updateuseruptime="UPDATE `SmartHouse`.`Users` SET `updater`='"+randomstring.generate()+"' WHERE `idUsers`="+req.body.user;
      handle_database(req,ress,updateuseruptime);

      pool.query(temp,function(err,res){
      if(err) {
            ress.send("Error with sentax please follow this example: INSERT INTO");
             console.log("Error"+err);
            }else{
                 ress.send("Last insert ID: " +res.insertId);
                 console.log('Last insert ID:', res.insertId);
             }
      });
    }

      // var temp="INSERT INTO `SmartHouse`.`Temp` (`cTemp`, `idUsers`) VALUES ('23', '1')";
      //    handle_database(req,res);
 });

 app.post("/bootup",function(req,res){
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
   var currentTemp="SELECT cTemp as Temp FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) and Year(now()) = year(tDate) ORDER BY tDate DESC limit 1";
   var avgDailyTemp="SELECT ROUND((AVG(cTemp)),2)  AS AVGD FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";
   var avargemonthly="SELECT ROUND((AVG(cTemp)),2)  AS AVGM FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and year(now()) = year(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";
   var avgSeason="SELECT ROUND((AVG(cTemp)),2)  AS AVGS FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and  year(now()) = year(tDate) and Season='"+season+"'";
   var devicesmode="SELECT Device_Mode as dMode From SmartHouse.Devices WHERE idUsers="+req.body.user+" Order BY Device_Name Asc";
   pool.query(currentTemp+";"+avgDailyTemp+";"+avargemonthly+";"+avgSeason+";"+devicesmode, function(err, results) {
     if (err) {console.log("somthing went wrong")};
     // `results` is an array with one element for every statement in the query:
     res.send(results);
     console.log(results); // [{1: 1}]
   // [{2: 2}]
   });

 });

 // app.get("/push",function(req,res){
 //   Pushbots.setMessage("Be Aware Smoke is detected" ,1);
 //  //  Pushbots.sendByTags("2");
 //   Pushbots.customNotificationTitle("Fire Alert");
 //   Pushbots.push(function(response){
 //        res.send(response);
 //    });
 // });
 app.post("/changeDeviceMode",function(req,ress){

      var query="UPDATE SmartHouse.Devices SET Device_Mode="+req.body.DM+" WHERE idUsers="+req.body.user+" and Device_Name='"+req.body.DN+"'";
      pool.query(query,function(err,res){
      if(err) {
               ress.json([{"status":"Something Went Wrong"}]);
             console.log("Error"+err);
            }else{

                 if(res.changedRows==1&&res.affectedRows==1)
                 {
                   ress.json([{"status":"Device Status Changed"}]);
                 }else if (res.changedRows==0&&res.affectedRows==0){
                   ress.json([{"status":"Device Is Not Connected"}]);
                 }else if (res.changedRows==0&&res.affectedRows==1){
                   ress.json([{"status":"Device Status Is Not Changed"}]);
                 }

             }
      });

      // var temp="INSERT INTO `SmartHouse`.`Temp` (`cTemp`, `idUsers`) VALUES ('23', '1')";
      //    handle_database(req,res);
 });


 app.listen(3000);
