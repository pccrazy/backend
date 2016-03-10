// old codes
//
 app.post("/avgSeason",function(req,res){

   var query="SELECT ROUND((AVG(cTemp)),2)  AS AVG FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and  year(now()) = year(tDate) and Season='"+season+"'";
   handle_database(req,res,query);;
 });

 app.post("/currentTemp",function(req,res){
   var query="SELECT cTemp as Temp FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) and Year(now()) = year(tDate) ORDER BY tDate DESC limit 1";
   handle_database(req,res,query);;
 });

 app.post("/avgMonthlyTemp",function(req,res){
      var query="SELECT ROUND((AVG(cTemp)),2)  AS AVG FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and year(now()) = year(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";
      handle_database(req,res,query);
 });

 app.post("/avgDailyTemp",function(req,res){
      var query="SELECT ROUND((AVG(cTemp)),2)  AS AVG FROM Temp JOIN Users USING(idUsers) where idUsers="+req.body.user+" and dayofyear(now()) = dayofyear(tDate) and month(now()) = month(tDate) ORDER BY tDate DESC";
      handle_database(req,res,query);
 });
