// setup -------------------------------------------------------------------------
let express = require("express");
let app = express(); // create app with express
let mongoose = require("mongoose");  // mongoose for mongodb
let port = process.env.PORT || 8080; // set the port
let database = require('./config/database'); // load database config

let cors = require("cors"); // TODO
let bodyParser = require("body-parser"); // body parser saves us typing

// config -------------------------------------------------------------------------
mongoose.connect(database.url, { useNewUrlParser: true ,useUnifiedTopology: true }); // connect to mongodb database


  app.use(express.static(__dirname + '/public'));  // Set static files location /public/(....) will be (...)

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


// routes -------------------------------------------------------------------------
require('./app/routes.js')(app);

// listen (start app with node server.js) -----------------------------------------
app.listen(port);
console.log("App listening on port " + port);
