'use strict';

// Using a location json, returns array of nearby posts
exports.getNearby = function(req, res, pool) {
	// If the POST recieved is a location object (expecting an array of posts in response that are from the nearby area)
    console.log("Object type is location"); // Debugging
    console.log(req.body.latitude); // Debugging
    console.log(req.body.longitude); // Debugging
    pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
        connection.query("Call getnearby(" + req.body.latitude + "," + req.body.longitude + ");", function (err, rows) { // Send the query asking for the full table of that zip code and the 00000 zip code to the db, returns the rows json object, passed to the function
        //connection.query("Call getnearby(" + 5 + "," + 5 + ");", function (err, rows) { // For Debugging
            console.log(rows[0]); // Debugging
            if (!err) {
                // If there is no error from the db
                res.status(200); // Send a 200 code (meaning there was no error)
                res.send(rows[0]); //  Send the json object representing the rows that were received
            } else {
                console.log(err);
            }
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
        console.log("Post attempt: latitude - " + req.body.post.latitude + " - longitude - " + req.body.post.longitude); // Debugging
        console.log("content - " + req.body.post.content + " - author - " + req.body.post.author);
        console.log("Exact SQL query: " + "CALL postnearby(" + req.body.post.latitude + ", " + req.body.post.longitude + ", \"" + req.body.post.content + "\", \"" + req.body.post.author + "\")");
        connection.query("CALL postnearby(" + req.body.post.latitude.toFixed(4) + ", " + req.body.post.longitude.toFixed(4) + ", \"" + req.body.post.content + "\", \"" + req.body.post.author + "\")", function (err, rows) {
            if(!err){
                // Inserted Successfully!
		console.log(rows);
                res.status(200).end(); // Send a status 200 (success) and end code back to the app
            }else{
                res.status(500).send("There was an error posting into this Thread.").end();
                console.log("Error posting into nearby threads: ", err);
            }
            connection.release(); // Release the db connection back to the pool
        });
    });
};

exports.upvote = function(req, res, pool){
    console.log("req body is " + JSON.stringify(req.body));
    var postId = req.body.data;
    pool.getConnection(function(err, connection){
        console.log("Upvote attempt for post: " + postId);
        connection.query("CALL upvote(" + postId + ");", function(err, rows){
            if(!err){
                console.log("Upvote successful.");
                res.status(200).end();
            }else{
                res.status(500).send("There was an error upvoting this thread.").end();
                console.log("Error upvoting thread: " + err);
            }
            connection.release();
        });
    });
};
exports.downvote = function(req, res, pool){
    var postId = req.body.data;
    pool.getConnection(function(err, connection){
        console.log("Downvote attempt for post: " + postId);
        connection.query("CALL downvote(" + postId + ");", function(err, rows){
            if(!err){
                console.log("Downvote successful.");
                res.status(200).end();
            }else{
                res.status(500).send("There was an error downvoting this thread.").end();
                console.log("Error downvoting thread.");
            }
            connection.release();
        });
    });
};
