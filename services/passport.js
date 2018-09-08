const db = require("../models");

module.exports = function (passport, user) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const keys = require("../config/keys.js");

    var User = user;

    //tells passport to get user ID and put that info into a cookie
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    //pull out identifying info about a user for the future from a cookie
    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => {
            done(null, user);
        });
    });

    passport.use(
        new GoogleStrategy({
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: "/auth/google/callback",
            //workaround to allow heroku to use google Oauth
            proxy: true
        },
            async (accessToken, refreshToken, profile, done) => {
                const existingUser = await User.findOne({ googleId: profile.id })

                if (existingUser) {
                    return done(null, existingUser);
                    // console.log(existingUser);
                } 
                const user = await new User({ googleId: profile.id }).save()
                done(null, user);

                console.log("access token", accessToken);
                console.log("refresh token", refreshToken);
                console.log("profile: ", profile);
            }
        )
    );

};