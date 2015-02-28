var mysql = require('mysql') // Require mysql package
var http = require('http') // Require http package
var express = require('express') // Require express package
var bodyParser = require('body-parser') // Require body-parser package

var user = {
    username: 'test',
    password: 'p'
}


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

function getZipcode(arr) {
    return "80126";
}

// Main post checking function
app.post('/', function (req, res) {
    console.log("Recieved post"); // For debugging
    if (req.get('Object-Type') == "location") {
        // If the POST recieved is a location object (expecting an array of posts in response that are from the nearby area)
        console.log("Object type is location"); // Debugging
        var zip = getZipcode([req.body.latitude, req.body.longitude]); // TODO replace with a square lookup or something
        console.log(req.body.latitude); // Debugging
        console.log(req.body.longitude); // Debugging
        pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
            connection.query("SELECT * FROM zip_00000 UNION ALL SELECT * FROM zip_" + zip, function (err, rows) { // Send the query asking for the full table of that zip code and the 00000 zip code to the db, returns the rows json object, passed to the function
                console.log(rows); // Debugging
                if (!err) {
                    // If there is no error from the db
                    res.status(200); // Send a 200 code (meaning there was no error)
                    res.json(rows); //  Send the json object representing the rows that were received
                }
                connection.release(); // Put the db connection back in the pool
                res.end(); // Send the END packet thing to the request, ending the connection created by the POST from the app
            });
        });
    };
    if (req.get('Object-Type') == "nearbypostattempt") {
        // If the server recieves an object containing the post and location and user info required to make a new nearby post
        // TODO add authentication HERE, just a token verification
        var zip = getZipcode([req.body.latitude, req.body.longitude]); // TODO replace with lat/long square lookup
        pool.getConnection(function (err, connection) {
            // Create the conneciton to the database
            connection.query("INSERT INTO zip_" + zip + "(title,owner,category,timestamp,latitude,longitude,content) VALUES (\"" + req.body.post.title + "\", \"" + req.body.user.name + "\", \"" + req.body.post.category + "\", Now(), " + req.body.post.latitude + ", " + req.body.post.longitude + ", \"" + req.body.post.content + "\")", function (err, rows) {
                // Insert the post information into the square it belongs
                res.status(200).end(); // Send a status 200 (success) and end code back to the app
                connection.release(); // Release the db connection back to the pool
            });
        });
    };
});

app.post('/newUser', function (req, res) {
    if (req.get('Object-Type') == "newuser") {
        // If the POST object is an attempt to make a new user
        pool.getConnection(function (err, connection) {
            // Make a connection the the db
            connection.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email = \"" + req.body.email + "\")", function (err, rows) {
                // Return a query "rows" that contains a 1 if the email exists, 0 if not
                console.log(rows); // Debugging
                if (rows[0][Object.keys(rows[0])[0]] == 1) { // Access the 0 or 1
                    res.status(403).send("Email already exists").end(); //  If 1, send a response saying the email is already in the server
                } else {
                    // TODO login stuff here, creating a token to send back and one to store
                    connection.query("INSERT INTO Users (email, password, name, age) VALUES (\"" + req.body.email + "\", \"" + req.body.password + "\", \"" + req.body.name + "\", " + req.body.age + ")", function (err, rows) {
                        // Adds the user info to the Users table
                        // TODO return the token information back to the POST response
                        res.status(200).send("User successfully created").end(); // Send a confirmation that the user was created and a code 200
                    })
                }
                connection.release(); // Release db connection to pool
            });
        });
    }
});

app.post('/login', authenticate, function (req, res) {
    res.send(user);
});



app.listen(8080, "52.11.79.134" , function () {
    console.log('App listening on localhost:8080')
}); // Listen on port 8080 for these posts (default http port)


// UTIL FUNCTIONS

function authenticate(req, res, next) {
    var body = req.body;
    if (!body.username || !body.password) {
        res.status(400).end('Must provide username or password')
    }
    if (body.username !== user.username || body.password !== user.password) {
        res.status(401).end('Username or password incorrect');
    }
    next();
};