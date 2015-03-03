var mysql = require('mysql'); // Require mysql package
var http = require('http'); // Require http package
var express = require('express'); // Require express package
var bodyParser = require('body-parser'); // Require body-parser package
var faker = require('faker'); //Require faker package
var cors = require('cors'); //Require cors package
var jwt = require('jsonwebtoken'); //Require jwt package
var expressJwt = require('express-jwt');

var jwtSecret = 'fjkdlsajfoew239053/3uk';

// Modules
var nearby = require('./nearby');
var users = require('./users');

// Set up mysql pool for creating connections to db
var pool = mysql.createPool({
    host: "threadsmaindb.cbbxphbgixf1.us-west-2.rds.amazonaws.com",
    database: "ThreadsDB",
    user: "sumBits",
    password: "dbpassword",
    connectionLimit: 10
});

var app = express();
app.use(bodyParser.json()); // Add support for JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // Add support for URL-encoded bodies
app.use((expressJwt({
    secret: jwtSecret
}).unless({
    path: ['/login', '/newUser', '/nearbyRO']
})));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Read-only post checking, while user isn't logged in
app.post('/nearbyRO', function(req, res) {
    console.log("Recieved post requesting Read-Only posts");
    nearby.getNearby(req, res, pool);
});

// Main post checking function
app.post('/nearby', function (req, res) {
    console.log("Recieved post"); // For debugging
    if (req.get('Object-Type') == "location") {
        nearby.getNearby(req, res, pool);
    }
    if (req.get('Object-Type') == "nearbypostattempt") {
        nearby.postNearby(req, res, pool);
    }
});

app.post('/newUser', function (req, res) {
    users.newUser(req, res, pool);
});

app.post('/login', function (req, res) {
    users.login(req, res, pool);
});

app.get('/random-user', function (req, res) {
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
});

app.post('/me', authenticate, function (req, res) {
    console.log("User provided to me is: ",req.user);
    res.send(req.user);
});



app.listen(8080, "0.0.0.0", function () {
    console.log('App listening on server:8080')
}); // Listen on port 8080 for these posts (default http port)


// UTIL FUNCTIONS

function authenticate(req, res, next) {
    console.log("Auth Called");
    jwt.verify(req.body.token, jwtSecret, function(err, decoded){
        if(err){
            res.status(401).end("You are not logged in.");
        }
    });
    next();
};
