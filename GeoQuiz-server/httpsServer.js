// express is the server that forms part of the nodejs program
var express = require('express');
var app = express();

var https = require('https');
var fs = require('fs');
var privateKey = fs.readFileSync('/home/studentuser/certs/client-key.pem').toString();
var certificate = fs.readFileSync('/home/studentuser/certs/client-cert.pem').toString();
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");

// now convert the configruation file into the correct format -i.e. a name/value pair array
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
    var split = configarray[i].split(':');
    config[split[0].trim()] = split[1].trim();
}


console.log(config);

var pg = require('pg');
var pool = new pg.Pool(config)

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

httpsServer.listen(4443);

// adding functionality to allow cross-domain queries when PhoneGap is running a server
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.post('/reflectData',function(req,res){
  // note that we are using POST here as we are uploading data
  // so the parameters form part of the BODY of the request rather than the RESTful API
  console.dir(req.body);

  // for now, just echo the request back to the client
  res.send(req.body);
});


app.post('/uploadQuestion',function(req,res){
  // note that we are using POST here as we are uploading data
  // so the parameters form part of the BODY of the request rather than the RESTful API
  console.dir(req.body);

  pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
      // pull the geometry component together
      // note that well known text requires the points as longitude/latitude !
      // well known text should look like: 'POINT(-71.064544 42.28787)'
      var param1 = req.body.question_title;
      var param2 = req.body.question_text;
      var param3 = req.body.answer_1;
      var param4 = req.body.answer_2;
      var param5 = req.body.answer_3;
      var param6 = req.body.answer_4;
      var param7 = req.body.port_id;
      var param8 =req.body.correct_answer ; 
     
      var geometrystring = "st_geomfromtext('POINT("+req.body.longitude+ " "+req.body.latitude +")',4326)";
      var querystring = "INSERT into public.quizquestion (question_title,question_text,answer_1,answer_2, answer_3, answer_4,port_id,correct_answer,location) values ";
      querystring += "($1,$2,$3,$4,$5,$6,$7,$8,";
      querystring += geometrystring + ")";
              console.log(querystring);
              client.query( querystring,[param1,param2,param3,param4,param5,param6,param7,param8],function(err,result) {
                done();
                if(err){
                     console.log(err);
                     res.status(400).send(err);
                }
                else {
                  res.status(200).send("Question "+ req.body.question_text+ " has been inserted");
                }
             });
      });
});


app.post('/uploadAnswer',function(req,res){
  // note that we are using POST here as we are uploading data
  // so the parameters form part of the BODY of the request rather than the RESTful API
  console.dir(req.body);

  pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

var param1 =  req.body.port_id ;
var param2 =  req.body.question_id ;
var param3 =  req.body.answer_selected;
var param4 =  req.body.correct_answer ;


var querystring = "INSERT into public.quizanswers (port_id, question_id, answer_selected, correct_answer) values (";
querystring += "$1,$2,$3,$4)";
        console.log(querystring);
        client.query(querystring,[param1,param2,param3,param4],function(err,result) {
          done();
          if(err){
               console.log(err);
               res.status(400).send(err);
          }
          res.status(200).send("Answer inserted for user "+req.body.port_id);
       });
    });
});

app.get('/getQuizPoints/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          var colnames = "id, question_title, question_text, answer_1,";
          colnames = colnames + "answer_2, answer_3, answer_4, port_id, correct_answer";
          console.log("colnames are " + colnames);

          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
         var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
          querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
          querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l      )) As properties";
          querystring += "   FROM public.quizquestion As lg ";
         querystring += " where port_id = $1 limit 100  ) As f ";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});

// Code to see answers uploaded in the database
app.get('/getQuizAns/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
         var querystring = "  SELECT * FROM public.quizanswers";
         querystring += " where port_id = $1";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});

// Code to see all answers uploaded in the database (for testing purpose only)
app.get('/getQuizAnswers', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
          // run the second query
          client.query('SELECT * FROM public.quizanswers',function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});

// Code to see users correct answers (Quiz App)
app.get('/getCorrectAnswer/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
         var querystring = "SELECT COUNT(*) AS num_questions from public.quizanswers where (answer_selected = correct_answer) and port_id = $1";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
             res.status(200).send(result.rows[0]["num_questions"]);
        });
    });

});

// Code to see users rank (Quiz App)
app.get('/getRanking/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
         var querystring = "select c.rank from (SELECT b.port_id, rank()over (order by num_questions desc) as rank from (select COUNT(*) AS num_questions, port_id from public.quizanswers where answer_selected = correct_answer group by port_id) b) c where c.port_id = $1";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows[0]["rank"]);
        });
    });

});

// Code to see top 5 scorers (Quiz App)

app.get('/getTopScorers', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
        var querystring = "select array_to_json (array_agg(c)) from (select rank() over (order by num_questions desc) as rank , port_id from (select COUNT(*) AS num_questions, port_id from public.quizanswers where answer_selected = correct_answer group by port_id) b limit 5) c";
          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
          // run the second query
          client.query(querystring,function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows[0]);
        });
    });

});

// Code for graph showing daily participation rates for user id only (Question App)

app.get('/getParticipationRateUser/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
         var querystring = "select array_to_json (array_agg(c)) from (select * from public.participation_rates where port_id = $1) c";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows[0]);
        });
    });

});

// Code for graph showing daily participation rates for all users(Question App)

app.get('/getParticipationRateAll', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
        var querystring = "select  array_to_json (array_agg(c)) from (select day, sum(questions_answered) as questions_answered, sum(questions_correct) as questions_correct from public.participation_rates group by day) c ";
          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
          // run the second query
          client.query(querystring,function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows[0]);
        });
    });

});

//code to add a map layer showing all the questions added in the last week (by any user). (Questions App)

app.get('/getLastPoints', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          var colnames = "id, question_title, question_text, answer_1,";
          colnames = colnames + "answer_2, answer_3, answer_4, port_id, correct_answer";
          console.log("colnames are " + colnames);

          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
         var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
          querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
          querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l      )) As properties";
          querystring += "   FROM public.quizquestion As lg limit 100  ) As f ";
          console.log(querystring);
          // run the second query
          client.query(querystring,function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows [0]);
        });
    });

});

// map layer showing the 5 questions closest to the user’s current location, added by any user

app.get('/getClosePoints/:lng/:lat', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          var colnames = "id, question_title, question_text, answer_1,";
          colnames = colnames + "answer_2, answer_3, answer_4, port_id, correct_answer";
          console.log("colnames are " + colnames);

          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
         var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features";
         querystring += "  FROM (SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry,";
         querystring += " row_to_json((SELECT l FROM (SELECT id, question_title, question_text, answer_1, answer_2, answer_3, answer_4, port_id, correct_answer) As l )) As properties";
         querystring += " FROM   (select c.* from public.quizquestion c inner join (select id, st_distance(a.location, st_geomfromtext('POINT("+req.params.lng+" "+req.params.lat+")',4326)) as distance";
         querystring += " from public.quizquestion a order by distance asc limit 5) b on c.id = b.id ) as lg) As f";

          console.log(querystring);
          // run the second query
          client.query(querystring,function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});

// Code to get the most difficult questions (Questions App)

app.get('/getHardPoints', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          var querystring = "select array_to_json (array_agg(d)) from (select c.* from public.quizquestion c inner join (select count(*) as incorrectanswers, question_id from public.quizanswers where answer_selected <> correct_answer group by question_id order by incorrectanswers desc limit 5) b on b.question_id = c.id) d";
          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
          // run the second query
          client.query(querystring,function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});

// Quiz App: map showing the last 5 questions that the user answered (colour coded depending on whether they were right/wrong the first time they answered the question)

app.get('/getUserFiveLast/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          var colnames = "id, question_title, question_text, answer_1,";
          colnames = colnames + "answer_2, answer_3, answer_4, port_id, correct_answer";
          console.log("colnames are " + colnames);

          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
         var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
          querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
          querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l      )) As properties";
          querystring += " FROM (select a.*, b.answer_correct from public.quizquestion a inner join ";
      querystring += " (select question_id, answer_selected=correct_answer as answer_correct from public.quizanswers";
      querystring += " where port_id = $1 order by timestamp desc limit 5) b on a.id = b.question_id) as lg) As f";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});

// -- Quiz App: App only shows questions and calculates proximity alerts for questions that the user hasn’t answered correctly
// -- so generate a list of incorrectly answered or unanswered questions for this user
app.get('/getUserUnanswered/:port_id', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
          var colnames = "id, question_title, question_text, answer_1,";
          colnames = colnames + "answer_2, answer_3, answer_4, port_id, correct_answer";
          console.log("colnames are " + colnames);
          var param1 = req.params.id;

          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit
         var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
          querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
          querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l      )) As properties";
          querystring += "  FROM (select * from public.quizquestion where id in (select question_id from public.quizanswers where port_id = $1 and answer_selected <> correct_answer union all select id from public.quizquestion where id not in (select question_id from public.quizanswers) and port_id = $2) ) as lg) As f";
          console.log(querystring);
          var port_id = req.params.port_id; //
          // run the second query
          client.query(querystring,[param1,port_id],function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                  console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });
    });

});


app.get('/getGeoJSON/:tablename/:geomcolumn', function (req,res) {
     pool.connect(function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }

        var colnames = "";
        var param1 = req.params.tablename;
        var param2 = req.params.geomcolumn;
        console.log(req.params.tablename);
        console.log(req.params.geomcolumn);
          // first get a list of the columns that are in the table
        // use string_agg to generate a comma separated list that can then be pasted into the next query
        var querystring = "select string_agg(colname,',') from ( select column_name as colname ";
        querystring += " FROM information_schema.columns as colname ";
        querystring += " where table_name   = $1";
        querystring += " and column_name <> $2";
        querystring += " and data_type <> 'USER-DEFINED') as cols ";

          console.log(querystring);

          // now run the query
          client.query(querystring,[param1,param2],function(err,result){
          //call `done()` to release the client back to the pool
            done();
            if(err){
                console.log(err);
                  res.status(400).send(err);
            }
            colnames = result.rows[0]['string_agg'];
            console.log("colnames are " + colnames);

          // now use the inbuilt geoJSON functionality
          // and create the required geoJSON format using a query adapted from here:
          // http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
          // note that query needs to be a single string with no line breaks so built it up bit by bit

              var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
              querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg." + req.params.geomcolumn+")::json As geometry, ";
              querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + ") As l      )) As properties";
              querystring += "   FROM "+req.params.tablename+"  As lg limit 100  ) As f ";
              console.log(querystring);

        

          // run the second query
          client.query(querystring,function(err,result){
            //call `done()` to release the client back to the pool
            done();
            if(err){
                            console.log(err);
                  res.status(400).send(err);
             }
            res.status(200).send(result.rows);
        });

        });
    });
});


app.get('/', function (req, res) {
  // run some server-side code
  console.log('the http server has received a request');
  res.send('Hello World from the http server');
});


// finally - serve static files for requests that are not met by any of the
// code above
// serve static files - e.g. html, css
app.use(express.static(__dirname));
