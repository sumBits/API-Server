'use strict';

var nearby = require('../controllers/nearbyThreads');
var users = require('../controllers/users');

module.exports = function (app, pool) {
    
    // Read-only post checking, while user isn't logged in
    app.post('/nearbyRO', function (req, res) {
        console.log("Recieved post requesting Read-Only posts");
        nearby.getNearby(req, res, pool);
    });

    // Main nearby post checking function
    //needs authentication step included
    app.post('/nearbyPost', users.authenticate, function (req, res) {
        nearby.postNearby(req, res, pool);
    });
    
};