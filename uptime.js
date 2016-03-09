var mysql      = require('mysql');
var moment = require('moment')
require('events').EventEmitter.defaultMaxListeners = Infinity;
var pool      =    mysql.createPool({
  connectionLimit : 300, //important
  host     : 'evcenterdbnew.cbgvwlnpk0gj.us-east-1.rds.amazonaws.com',
  user     : 'root',
  password : 'iaminlovewithaws',
  database : 'SmartHouse',
  debug    :  false,
  multipleStatements: true
});


var Users="SELECT idUsers,updatedAt FROM SmartHouse.Users";
handle_database(Users);
function handle_database(Query) {

   // get connection then release if error
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          console.log({"code" : 100, "status" : "Error in connection database"});
          return;
        }
        console.log('connected as id ' + connection.threadId);


        // do the query then release connectoin
        connection.query(Query,function(err,rows){
         connection.release();
            if(!err) {
                for(var row in rows)
                {
                  var endDate = moment(new Date()).format("YYYY-MM-DD HH:mm");
                  var startDate = moment(new Date(rows[row].updatedAt)).format("YYYY-MM-DD HH:mm");
                  var diff = moment(endDate).diff(startDate, 'minute');
                  if(diff>10){
                    console.log(rows[row].idUsers+" is having a problem in his network ");
                  }
                  console.log(" "+startDate + " "+ endDate+" "+diff);
                }

            }else{
                console.log({"code" : 102, "status" : "Error in user"});
            }
        });

        // listener in case of error in the connection
        connection.on('error', function(err) {
              console.log({"code" : 100, "status" : "Error in connection database"});
              return;
        });
  });
}
var now = (function () {
    var year = new Date(new Date().getFullYear().toString()).getTime();
    return function () {
        return Date.now() - year
    }
})();
