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

// UTIL FUNCIONS

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
};

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
};