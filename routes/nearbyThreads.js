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
    app.post('/nearby', users.authenticate, function (req, res) {
        console.log("Recieved post"); // For debugging
        if (req.get('Object-Type') == "location") {
            nearby.getNearby(req, res, pool);
        }
        if (req.get('Object-Type') == "nearbypostattempt") {
            nearby.postNearby(req, res, pool);
        }
    });
    
};