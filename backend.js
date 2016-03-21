// monitors http request
var pmx = require('pmx').init({
  http          : true, // HTTP routes logging (default: true)
  ignore_routes : [/socket\.io/, /notFound/], // Ignore http routes with this p$
  errors        : true, // Exceptions loggin (default: true)
  custom_probes : true, // Auto expose JS Loop Latency and HTTP req/s as custom$
  network       : true, // Network monitoring at the application level
  ports         : true  // Shows which ports your app is listening on (default:$
});
var request = require('request');
var mysql      = require('mysql');
var express    = require("express");
var bodyParser = require('body-parser');
var randomstring = require("randomstring");
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
var tools=require("./Tools")
//require('events').EventEmitter.defaultMaxListeners = Infinity;
//support encoded bodies
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
 };

 app.post("/createJob",function(req,respond){
  var checkJob="SELECT idSecdualer FROM SmartHouse.Secdualer where Job='"+req.body.job+"' and idUser="+req.body.user;
   var devicesmode="INSERT INTO `SmartHouse`.`Secdualer` (`idUser`, `Comment`,`Job`, `DeviceStatus`) VALUES ('"+req.body.user+"','"+req.body.comment+"' ,'"+req.body.job+"', '"+req.body.deviceStatus+"')";
   pool.query(checkJob,function(err,rows){
       if(!err) {
         console.log(rows.length);
         if(rows.length==0){

           request({
  uri: "http://10.8.0.6:4000/job",
  method: "POST",
  timeout: 10000,
  followRedirect: true,
  form: {job:req.body.job,dstatus:req.body.deviceStatus}
   }, function(error, response, body) {
     if(!error&& response.statusCode == 200){
       if(body=="ack"){
         pool.query(devicesmode,function(err,res){
         if(err) {
               respond.send("Somthing Went Wrong");
                console.log("Error"+err);
               }else{

                    respond.send("Job is successfully created");
                    console.log('Last insert ID:', res.insertId);
                }
         });
       }

   }else{
        console.log("Somthing Wrong With The Connection");
      respond.send("Somthing Wrong With The Connection");
   }
  });

         }else{
               respond.send("You already have a job at that Time and Date");
         }
       }else{
         res.json({"code" : 102, "status" : "Error in user"});
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

 app.post("/token",function(req,respond){
   console.log(req.body.token+" "+req.body.user);
  var devicesmode="UPDATE `SmartHouse`.`Users` SET GCM='"+req.body.token+"' WHERE idUsers="+req.body.user;
  handle_database(req,respond,devicesmode);
 });



 app.post("/settemp",function(req,ress){
      if(req.body.temp>0.0){
      var temp="INSERT INTO `SmartHouse`.`Temp` (`cTemp`, `idUsers`, `Season`) VALUES ("+req.body.temp+","+req.body.user+",'"+tools.getseason()+"')";
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
 });

 app.post("/bootup",function(req,res){
   var currentTemp="SELECT cTemp as Temp FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) and Year(now()) = year(tDate) ORDER BY tDate DESC limit 1";
   var avgDailyTemp="SELECT ROUND((AVG(cTemp)),2)  AS AVGD FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";
   var avargemonthly="SELECT ROUND((AVG(cTemp)),2)  AS AVGM FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and year(now()) = year(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";
   var avgSeason="SELECT ROUND((AVG(cTemp)),2)  AS AVGS FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and  year(now()) = year(tDate) and Season='"+tools.getseason()+"'";
   var devicesmode="SELECT Device_Mode as dMode From SmartHouse.Devices WHERE idUsers="+req.body.user+" Order BY Device_Name Asc";
   pool.query(currentTemp+";"+avgDailyTemp+";"+avargemonthly+";"+avgSeason+";"+devicesmode, function(err, results) {
     if (err) {console.log("somthing went wrong")};
     // `results` is an array with one element for every statement in the query:
     res.send(results);
     console.log(results); // [{1: 1}]
   // [{2: 2}]
   });

 });

 app.post("/sendEmail",function(req,respond){
     tools.sendEmail(req,respond);
 });

  app.post("/sendSms",function(req,res){
     var getnumber="SELECT praimary_pn,seconedry_pn FROM SmartHouse.Users where idUsers=1";
      pool.query(getnumber,function(err,rows){
         if(!err) {
           for(var index in rows){
             tools.sendSms(rows[index].praimary_pn);
             tools.sendSms(rows[index].seconedry_pn);
           }
          res.json(rows);
         }else{
           res.json({"code" : 102, "status" : "Error in user"});
         }
     });
     //

  });
  app.post("/alert",function(req,res){
     var alert="SELECT FROM SmartHouse.Users where idUsers="+req.body.user;
      pool.query(alert,function(err,rows){
         if(!err) {
           for(var index in rows){
             tools.sendSms(rows[index].praimary_pn);
             tools.sendSms(rows[index].seconedry_pn);
             tools.sendSms(rows[index].third_pn);
             tools.pushNotification(rows[index].GCM);
             tools.sendEmail(rows[index].email);
           }
          res.json(rows);
         }else{
           res.json({"code" : 102, "status" : "Error in user"});
         }
     });
     //
  });
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
      if(req.body.DN=="D1"){
          tools.sendtoRas(5,req.body.DM)
      }else if(req.body.DN=="D2"){
          tools.sendtoRas(6,req.body.DM)
      }

 });


 app.listen(3000);
