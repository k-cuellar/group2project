var db = require("../models");

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    res.render("login");
  });

  // Load example page and pass in an example by id
  app.get("/chat", function(req, res) {
    res.render("chat");
  });

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
