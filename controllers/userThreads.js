'use strict';

exports.getPostsInThread = function(req, res, pool){
    console.log("Getting posts in thread: " + req.body.threadId);
    res.send(0).end();
};

exports.getUserThreads = function(req, res, pool){
    console.log(req.body);
    console.log("Getting user threads for user: " + req.body.data);
    res.send(0).end();
};

exports.postToThread = function(req, res, pool){
    console.log("Posting to thread " + req.body.threadId + " the following content: " + req.body.post.content);
    res.send(0).end();
};