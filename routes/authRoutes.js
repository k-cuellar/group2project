const passport = require("passport");
const db = require("../models");

module.exports = app => {
    app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    app.get(
        '/auth/google/callback',
        passport.authenticate('google'),
        (req, res) => {
            //PLACEHOLDER - insert redirect page upon login
            res.redirect("/index");
        }
    );

    app.get('/api/logout', (req, res) => {
        req.logout();
        res.redirect("/");
    });

    app.get('/api/current_user', (req, res) => {
        res.send(req.user);
    })

};