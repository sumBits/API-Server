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
var nearby = require('./nearby')

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
    path: ['/login', '/newUser']
})));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/nearbyRO', function(req, res) {
    console.log("Recieved post requesting Read-Only posts");
    if (req.get('Object-Type') == 'location') {
        nearby.getNearby(req, res, pool);
    };
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
    // If the POST object is an attempt to make a new user
    pool.getConnection(function (err, connection) {
        // Make a connection the the db
        connection.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email = \"" + req.body.email + "\")", function (err, rows) {
            // Return a query "rows" that contains a 1 if the email exists, 0 if not
            console.log(rows); // Debugging
            if (rows[0][Object.keys(rows[0])[0]] == 1) { // Access the 0 or 1
                console.log("Email exists already.");
                res.status(403).send("Email already exists").end(); //  If 1, send a response saying the email is already in the server
            } else {
                console.log("Reached else in new user, meaning new user will be created.");
                // TODO login stuff here, creating a token to send back and one to store
                var q = connection.query("INSERT INTO Users SET ?", req.body, function (err, rows) {
                    console.log("Inserting into users.");
                    console.log("error: ", err);
                    if (err) {
                        res.status(500).send("The user failed to create.").end();
                    }
                    // Adds the user info to the Users table
                    // TODO return the token information back to the POST response
                    res.status(200).send("User successfully created").end(); // Send a confirmation that the user was created and a code 200
                });
                console.log(q.sql);
            }
            connection.release(); // Release db connection to pool
        });
    });
});

app.post('/login', function (req, res) {
    var token = jwt.sign({
        user: req.body.email
    }, jwtSecret);
    var body = req.body;
    if (!body.email || !body.password) {
        res.status(400).end('Must provide email or password')
    } else {
        pool.getConnection(function (err, connection) {
            // Make a connection the the db
            connection.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email = \"" + req.body.email + "\")", function (err, rows) {
                // Return a query "rows" that contains a 1 if the email exists, 0 if not
                console.log("rows: ", rows[0], "Object Keys: ", rows[0][Object.keys(rows[0])[0]]); // Debugging
                if (rows[0][Object.keys(rows[0])[0]] == 1) { // Access the 0 or 1
                    console.log("Email exists");
                    connection.query("SELECT password FROM Users WHERE email = \"" + req.body.email + "\"", function (err, psswd) {
                        console.log(psswd[0]);
                        console.log(psswd[0].password);
                        if (psswd[0].password == req.body.password) {
                            res.send({
                                token: token,
                                user: req.body.email
                            }).end();
                            console.log("password is correct", req.body.password);
                        } else {
                            console.log('password is incorrect');
                            res.status(401).end('Incorrect password');
                        };
                    })
                } else {
                    console.log("User doesn't exist.");
                    res.status(401).end('Incorrect email or password');
                }
                connection.release(); // Release db connection to pool
            });
        });
    };
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

function zoneLookup(arr) {
    var solution = "zone_";
    var lat = "";
    var lon = "";

    lat = Math.round(arr[0]) + "";
    if (arr[0] < 0) {
        solution = solution + "n";
    };
    solution = solution + lat;
    lon = Math.round(arr[1]) + "";
    if (arr[1] < 0) {
        solution = solution + "n";
    };
    solution = solution + lon;

    return solution;
}

function getZoneQuery(arr) {
    var lat = "";
    var lon = "";
    var solution = "SELECT * FROM worldwide UNION ALL SELECT * FROM zone_";
    var additionalzones = "";

    var lonpositive = false;
    var latpositive = false;
    var closetolat = false;
    var latclosetof = false;
    var closetolon = false;
    var lonclosetof = false;

    if (arr[0] >= 0) {
        latpositive = true;
        lat = Math.floor(arr[0]).toString();
        console.log("Lat is positive");
    } else {
        lat = "n" + Math.abs(Math.ceil(arr[0]));
        console.log("Lat is negative");
    };
    if (arr[1] >= 0) {
        lonpositive = true;
        lon = Math.floor(arr[1]).toString();
        console.log("Lon is positive");
    } else {
        lon = "n" + Math.abs(Math.ceil(arr[1]));
        console.log("Lon is negative");
    };

    if (latpositive) {
        if (Math.abs(Math.round(arr[0]) - arr[0]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[0]) == Math.floor(arr[0])) {
                latclosetof = true;
            };
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_" + Math.round(arr[0]) + "_" + lon;
        };
    } else {
        if (Math.abs(Math.round(arr[0]) - arr[0]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[0]) == Math.ceil(arr[0])) {};
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_n" + Math.abs(Math.round(arr[0])) + "_" + lon;
        };
    };

    if (lonpositive) {
        if (Math.abs(Math.round(arr[1]) - arr[1]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[1]) == Math.floor(arr[1])) {
                lonclosetof = true;
            };
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_" + lat + "_" + Math.round(arr[1]);
        };
    } else {
        if (Math.abs(Math.round(arr[1]) - arr[1]) < 0.1) {
            closetolat = true;
            if (Math.round(arr[1]) == Math.ceil(arr[1])) {};
            additionalzones = additionalzones + " UNION ALL SELECT * FROM zone_" + lat + "_n" + Math.abs(Math.round(arr[1]));
        };
    };

    if (closetolat && closetolon) {
        // TODO add code to add the corner zones to the query
    };

    solution = solution + lat + "_" + lon;
    console.log("Original solution: " + solution);
    solution = solution + additionalzones;
    console.log("Changed solution: " + solution);
    return solution;
}