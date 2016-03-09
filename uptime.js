var mysql      = require('mysql');
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

            if(!err) {
                for(var row in rows)
                {

                    console.log(rows[row].idUsers + " "+rows[row].updatedAt);
                }
                    connection.release();
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
