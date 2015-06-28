'use strict';

var userThreads = require('../controllers/userThreads');

module.exports = function(app, pool){

    app.post('/getPostsInUThread', function(req, res){
        console.log("Request to retrieve posts in a user thread received.");
        userThreads.getPostsInThread(req, res, pool);
    });

    app.post('/getPostsInUThreadUpdated', function(req, res) {
        console.log("Request to retrieve posts in a user thread recieved.");
        userThreads.getPostsInThreadUpdated(req, res, pool);
    });
    
    app.post('/getUserThreads', function(req, res){
        console.log("Request to retrieve a user's user threads has been received.");
        userThreads.getUserThreads(req, res, pool);
    });

    app.post('/getUserThreadsUpdated', function(req, res) {
        console.log("Request to retrieve a user's user threads has been received.");
        userThreads.getUserThreadsUpdated(req, res, pool);
    });
    
    app.post('/postToUThread', function(req, res){
        console.log("Request for a user to post to a thread has been received.");
        userThreads.postToThread(req, res, pool);
    });

    app.post('/postToUThreadUpdated', function(req, res) {
        console.log("Request for a user to post to a thread (updated) has been received.");
        userThreads.postToThreadUpdtaed(req, res, pool);
    });

    app.post('/joinUThread', function(req, res) {
        console.log("Request for a user to join a thread by Gen ID has been recieved.");
        userThreads.joinUThread(req, res, pool);
    });

    app.post('/createUThread', function(req, res) {
        console.log("Request to make new U thread");
        userThreads.createUThread(req, res, pool);
    });
};