var mysql = require('mysql'); // Require mysql package
var http = require('http'); // Require http package
var express = require('express'); // Require express package
var bodyParser = require('body-parser'); // Require body-parser package
var faker = require('faker'); //Require faker package
var cors = require('cors'); //Require cors package
var jwt = require('jsonwebtoken'); //Require jwt package
var expressJwt = require('express-jwt');

var jwtSecret = 'fjkdlsajfoew239053/3uk';

exports.getNearby = function(req, res, pool) {
	// If the POST recieved is a location object (expecting an array of posts in response that are from the nearby area)
    console.log("Object type is location"); // Debugging
    console.log(req.body.latitude); // Debugging
    console.log(req.body.longitude); // Debugging
    pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
        connection.query(getZoneQuery([req.body.latitude, req.body.longitude]), function (err, rows) { // Send the query asking for the full table of that zip code and the 00000 zip code to the db, returns the rows json object, passed to the function
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
};

exports.postNearby = function(req, res,  pool) {
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
};