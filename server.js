// Author: Ayman Kassab 2020
// server.js: main server entry point file

// Dependencies -------------------------------------------------------------------------
// express:
const express = require('express');

// path:
const path = require('path'); // a core module we didnt need to install

//  bodyParser:
//  - Takes the middleware, parses incoming request bodies. When we submit a form we can grab the data.
//  - See https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// cors:
//  - Middleware to make requests from our front end even if its on a different port (To make request to api from a
//    different domain name). By default they would get blocked if they tried to make certain requests
//  - we could do this instead without cors https://enable-cors.org/server_expressjs.html
//  - see https://www.npmjs.com/package/cors
const cors = require('cors');

// passport:
//  - Middleware token system to protect certain routes
const passport = require('passport');

// mongoose:
//  - Document object mapper to map work with mongodb
const mongoose = require('mongoose');

// config:
//  - Load database config
const config = require('./config/database');

// users route
const users = require('./routes/users');

// Connect database  -------------------------------------------------------------------------
mongoose.connect(config.database, { useNewUrlParser: true ,useUnifiedTopology: true });
// On connection let us know.
mongoose.connection.on('connected' ,()=> {
  console.log('Connected to database' + config.database);
});
// Let us know if there is an error.
mongoose.connection.on('error' ,(err)=> {
  console.log('Database error: ' + err);
});

// Initialize express  -------------------------------------------------------------------------
const app = express();
// Tell express to use cors, bodyparser, and passport
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);







// port number
const port = 8080;

// Set static files location /public/(....) will be (...)
app.use(express.static(path.join(__dirname, 'public')));

// config -------------------------------------------------------------------------
// Call the connect function for mongoose so we can connect to our database
// We need to add the location of the database. Lets create a config file and put the database in that



// tell express app to use some dependencies




// routes -------------------------------------------------------------------------
//require('./routes/routes.js')(app);

// anything that is localhost:8080/users/.. will go to the users file.
app.use('/users', users);


// start server ------------------------------------------
app.listen(port, () => {

  console.log("App listening on port " + port);
});
