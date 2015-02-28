var mysql = require('mysql') // Require mysql package
var http = require('http') // Require http package
var express = require('express') // Require express package
var bodyParser = require('body-parser') // Require body-parser package

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
    console.log("Recieved post");
    if (req.get('Object-Type') == "location") {
        console.log("Object type is location");
        var zip = getZipcode([req.body.latitude, req.body.longitude]);
        console.log(req.body.latitude);
        console.log(req.body.longitude);
        pool.getConnection(function (err, connection) {
            connection.query("SELECT * FROM zip_00000 UNION ALL SELECT * FROM zip_" + zip, function (err, rows) {
                console.log(rows);
                if (!err) {
                    res.status(200);
                    res.json(rows);
                }
                connection.release();
                res.end();
            });
        });
    };
    if (req.get('Object-Type') == "nearbypostattempt") {
        // Authenticate user
        var zip = getZipcode([req.body.latitude, req.body.longitude]);
        pool.getConnection(function (err, connection) {
            connection.query("INSERT INTO zip_" + zip + "(title,owner,category,timestamp,latitude,longitude,content) VALUES (\"" + req.body.post.title + "\", \"" + req.body.user.name + "\", \"" + req.body.post.category + "\", Now(), " + req.body.post.latitude + ", " + req.body.post.longitude + ", \"" + req.body.post.content + "\")", function (err, rows) {
                res.status(200).end();
                connection.release();
            });
        });
    };
    if (req.get('Object-Type') == "newuser") {
        pool.getConnection(function (err, connection) {
            connection.query("SELECT EXISTS(SELECT 1 FROM Users WHERE email = \"" + req.body.email + "\")", function (err, rows) {
                console.log(rows);
                if (rows[0][Object.keys(rows[0])[0]] == 1) {
                    res.status(403).send("Email already exists").end();
                } else {
                    // Create and store token
                    connection.query("INSERT INTO Users (email, password, name, age) VALUES (\"" + req.body.email + "\", \"" + req.body.password + "\", \"" + req.body.name + "\", " + req.body.age + ")", function (err, rows) {
                        // Return token
                        res.status(200).send("User successfully created").end();
                    })
                }
                connection.release();
            });
        });
    }
});

app.listen(8080);