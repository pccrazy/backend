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
  //  request.post({url:'http://10.8.0.6:4000/job',timeout:70, form: {job:req.body.job,dstatus:req.body.deviceStatus}},
  //  function(err,httpResponse,body)
  //    {
  //      console.log(err);
  //      console.log(httpResponse);
  //      if(!err&& httpResponse.statusCode == 200){
  //        if(body=="ack"){
  //          pool.query(devicesmode,function(err,res){
  //          if(err) {
  //                respond.send("Somthing Went Wrong");
  //                 console.log("Error"+err);
  //                }else{
   //
  //                     respond.send("Job is successfully created");
  //                     console.log('Last insert ID:', res.insertId);
  //                 }
  //          });
  //        }
   //
  //    }else{
  //         console.log("Somthing Wrong With The Connection");
  //       respond.send("Somthing Wrong With The Connection");
  //    }
   //
  //    });
