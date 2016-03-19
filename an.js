request.post({url:'http://service.com/upload', form: {key:'value'}},
function(err,httpResponse,body)
  {
    /* ... */
  }
  );
  console.log(rows.length);
  if(rows.length==0){
    if(tools.sendJobtoRas(req.body.job,req.body.deviceStatus)=="ack"){
      pool.query(devicesmode,function(err,res){
      if(err) {
            respond.send("Somthing Went Wrong");
             console.log("Error"+err);
            }else{

                 respond.send("Job is successfully created");
                 console.log('Last insert ID:', res.insertId);
             }
      });
    }else{
        respond.send("Connection error with system");
    }
  }else{
        respond.send("You already have a job at that Time and Date");
  }
