'use strict';

var jwt = require('jsonwebtoken'); //Require jwt package
var expressJwt = require('express-jwt');

var jwtSecret = 'fjkdlsajfoew239053/3uk';


exports.newUser = function (req, res, pool) {
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
};

exports.login = function (req, res, pool) {
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
                                user: req.body.email,
                                username: req.body.name
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
};

exports.authenticate = function authenticate(req, res, next) {
    console.log("Auth Called");
    jwt.verify(req.body.token, jwtSecret, function (err, decoded) {
        if (err) {
            res.status(401).end("You are not logged in.");
        }
    });
    next();
};