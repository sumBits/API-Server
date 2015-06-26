'use strict';

exports.getPostsInThread = function(req, res, pool){
    console.log("Getting posts in thread: " + req.body.threadId);
    res.send(null);
};

exports.getUserThreads = function(req, res, pool){
    console.log(req.body);
    console.log("Getting user threads for user: " + req.body.user);
    res.send(null);
};

exports.postToThread = function(req, res, pool){
    console.log("Posting to thread " + req.body.threadId + " the following content: " + req.body.post.content);
    res.send(null);
};