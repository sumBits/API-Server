'use strict';

var users = require('../controllers/users');

module.exports = function (app, pool) {
    app.post('/newUser', function (req, res) {
        users.newUser(req, res, pool);
    });

    app.post('/login', function (req, res) {
        users.login(req, res, pool);
    });
    app.post('/me', users.authenticate, function (req, res) {
        console.log("User provided to me is: ", req.user);
        res.send(req.user);
    });

};