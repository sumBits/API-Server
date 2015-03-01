var mysql = require('mysql'); // Require mysql package
var http = require('http'); // Require http package
var express = require('express'); // Require express package
var bodyParser = require('body-parser'); // Require body-parser package
var faker = require('faker'); //Require faker package
var cors = require('cors'); //Require cors package
var jwt = require('jsonwebtoken'); //Require jwt package
var expressJwt = require('express-jwt');

var jwtSecret = 'fjkdlsajfoew239053/3uk';



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
app.use((expressJwt({secret: jwtSecret }).unless({path: ['/login']})));
app.use(cors());

// Main post checking function
app.post('/nearby', function (req, res) {
    console.log("Recieved post"); // For debugging
    if (req.get('Object-Type') == "location") {
        // If the POST recieved is a location object (expecting an array of posts in response that are from the nearby area)
        console.log("Object type is location"); // Debugging
        console.log(req.body.latitude); // Debugging
        console.log(req.body.longitude); // Debugging
        pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
            connection.query(getZoneQuery([req.body.latitude,req.body.longitude]), function (err, rows) { // Send the query asking for the full table of that zip code and the 00000 zip code to the db, returns the rows json object, passed to the function
                console.log(rows); // Debugging
                if (!err) {
                    // If there is no error from the db
                    res.status(200); // Send a 200 code (meaning there was no error)
                    res.send(rows); //  Send the json object representing the rows that were received
                } // TODO create table here?
                connection.release(); // Put the db connection back in the pool
                res.end(); // Send the END packet thing to the request, ending the connection created by the POST from the app
            });
        });
    }
    if (req.get('Object-Type') == "nearbypostattempt") {
        // If the server recieves an object containing the post and location and user info required to make a new nearby post
        // TODO add authentication HERE, just a token verification
        pool.getConnection(function (err, connection) {
            // Create the conneciton to the database
            connection.query("INSERT INTO " + zoneLookup([req.body.latitude, req.body.longitude]) + " (title,owner,category,timestamp,latitude,longitude,content) VALUES (\"" + req.body.post.title + "\", \"" + req.body.user.name + "\", \"" + req.body.post.category + "\", Now(), " + req.body.post.latitude + ", " + req.body.post.longitude + ", \"" + req.body.post.content + "\")", function (err, rows) {
                // Insert the post information into the square it belongs
                res.status(200).end(); // Send a status 200 (success) and end code back to the app
                connection.release(); // Release the db connection back to the pool
            });
        });
    }
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
    var token = jwt.sign({
        user: req.email
    }, jwtSecret);
    res.send({
        token: token,
        user: req.user
    });
});

app.get('/random-user', function(req, res) {
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
});

app.get('/me', function(req, res) {
    console.log(req.user);
    res.send(req.user);
});



app.listen(8080, "0.0.0.0", function () {
    console.log('App listening on server:8080')
}); // Listen on port 8080 for these posts (default http port)


// UTIL FUNCTIONS

function authenticate(req, res, next) {
    console.log("Auth Called");
    console.log("req.body.user: ", req.body.user);
    var body = req.body;
    if (!body.email || !body.password) {
        res.status(400).end('Must provide email or password')
    } else {
        pool.getConnection(function (err, connection) {
            // Make a connection the the db
            connection.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email = \"" + req.body.email + "\")", function (err, rows) {
                // Return a query "rows" that contains a 1 if the email exists, 0 if not
                console.log(rows); // Debugging
                if (rows[0][Object.keys(rows[0])[0]] == 1) { // Access the 0 or 1
                    connection.query("SELECT password FROM Users WHERE email = \"" + req.body.email + "\"", function (err, psswd) {
                    	if (psswd[0] == req.body.password) {
                    		// Do stuff here if password is right
                    	} else {
                    		res.status(401).end('Incorrect password')
                    	};
                    })
                } else {
                    res.status(401).end('Incorrect email or password')
                }
                connection.release(); // Release db connection to pool
            });
        });
    };
    next();
};

function zoneLookup (arr) {
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
			if (Math.round(arr[0]) == Math.ceil(arr[0])) {
			};
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
			if (Math.round(arr[1]) == Math.ceil(arr[1])) {
			};
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
