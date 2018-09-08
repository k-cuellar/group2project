var db = require("../models");

module.exports = function(app) {
  // Load login
  app.get("/", function(req, res) {
    res.render("login");
  });

  // Load chat page
  app.get("/chat", function(req, res) {
    res.render("chat");
  });

  // Load index page
  app.get("/index", function(req, res) {
    // res.render("index");
    db.Favorite.findAll({}).then(function(dbFavorite) {
      res.render("index", {
        dbFavorite: dbFavorite
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
