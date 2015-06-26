'use strict';

var userThreads = require('../controllers/userThreads');

module.exports = function(app, pool){

    app.post('/getPostsInUThread', function(req, res){
        console.log("Request to retrieve posts in a user thread received.");
        userThreads.getPostsInThread(req, res, pool);
    });
    
    app.post('/getUserThreads', function(req, res){
        console.log("Request to retrieve a user's user threads has been received.");
        userThreads.getUserThreads(req, res, pool);
    });
    
    app.post('/postToUThread', function(req, res){
        console.log("Request for a user to post to a thread has been received.");
        userThreads.postToThread(req, res, pool);
    });
    
};