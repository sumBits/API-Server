'use strict';

exports.getPostsInThread = function (req, res, pool) {
    console.log("Getting posts in thread: " + req.body.data);
    var threadId = req.body.data;
    pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
        connection.query("CALL getUThreadPosts(" + threadId + ");", function (err, rows) {
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

exports.getPostsInThreadUpdated = function (req, res, pool) {
    console.log("Getting posts in thread: " + req.body.data);
    var threadGenId = req.body.data;
    pool.getConnection(function (err, connection) {
        connection.query("Call getUThreadPostsUpdated(" + threadGenId + ");", function (err, rows) {
            console.log(rows[0]);
            if (!err) {
                res.status(200);
                res.send(rows[0]);
            } else {
                console.log(err);
            }
            connection.release();
            res.end();
        })
    })
}

exports.getUserThreadsUpdated = function (req, res, pool) {
    console.log(req.body);
    console.log("Getting user threads for user (updated version): " + req.body.data);
    var user = req.body.data;

    pool.getConnection(function (err, connection) {
        connection.query("CALL getUserThreadsUpdated('" + user + "');", function (err, rows) {
            console.log(rows);
            if (!err) {
                // If no error from db
                res.status(200);
                res.send(rows[0]);
            } else {
                console.log(err);
            }
            connection.release();
            res.end();
        });
    });
};

exports.getUserThreads = function (req, res, pool) {
    console.log(req.body);
    console.log("Getting user threads for user: " + req.body.data);
    var user = req.body.data;

    pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
        connection.query("CALL getUserThreads('" + user + "');", function (err, rows) {
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

exports.postToThread = function (req, res, pool) {
    console.log(req.body);
    console.log("Posting to thread " + req.body.data.threadId + " the following content: " + req.body.data.content);
    var content = req.body.data.content;
    var id = req.body.data.threadId;
    var author = req.body.data.author;
    pool.getConnection(function (err, connection) { // Create the connection to the databasae, passed as connection to the function
        connection.query("CALL postUser('" + content + "','" + author + "'," + id + ");", function (err, rows) {
            if (!err) {
                // If there is no error from the db
                res.status(200); // Send a 200 code (meaning there was no error)
            } else {
                console.log(err);
            }
            connection.release(); // Put the db connection back in the pool
            res.end(); // Send the END packet thing to the request, ending the connection created by the POST from the app
        });
    });
};

exports.postToThreadUpdated = function (req, res, pool) {
    console.log(req.body);
    console.log("Posting to thread " + req.body.data.threadGenId + " the following content: " + req.body.data.content);
    var content = req.body.data.content;
    var genId = req.body.data.theadGenId;
    var author = req.body.data.author;
    pool.getConnection(function (err, connection) {
        connection.query("Call postUserUpdated('" + content + "','" + author + "','" + genId + "');", function (err, rows) {
            if (!err) {
                res.status(200);
            } else {
                console.log(err);
            }
            connection.release();
            res.end();
        });
    });
};

exports.joinUThread = function (req, res, pool) {
    console.log(req.body);
    console.log("Subscribing user " + req.body.user + " to the User Thread " + req.body.genId);
    var user = req.body.user;
    var genId = req.body.genId;
    pool.getConnection(function (err, connection) {
        connection.query("Call subscribe('" + user + "','" + genId + "');", function (err, rows) {
            if (!err) {
                res.status(200);
            } else {
                console.log(err);
            }
            connection.release();
            res.end();
        });
    });
};

exports.createUThread = function (req, res, pool) {
    console.log(req.body);
    pool.getConnection(function (err, connection) {
        connection.query("Call createNewUThread('" + req.body.threadTitle + "','" + req.body.threadGenId + "');", function (err, rows) {
            if (!err) {
                res.status(200);
            } else {
                console.log(err);
            }
            connection.release();
            res.end();
        });
    });
};
