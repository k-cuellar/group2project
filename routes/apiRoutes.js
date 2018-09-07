var db = require("../models");

module.exports = function(app) {
  // gets the first available room with a user in it that I have not already matched with
  app.get("/api/rooms/:user_id", function(req, res) {
    db.sequelize
      .query(
        "select id, user_id1 from rooms where user_id2 is null and user_id1 not in (select user_id1 from histories where user_id2 = ? union all select user_id2 from histories where user_id1 = ?) limit 1",
        { replacements: [req.params.user_id, req.params.user_id] }
      )
      .then(function(firstRoom) {
        res.json(firstRoom);
      });
  });

  // create an empty room if one doesn't exist above
  app.post("/api/rooms", function(req, res) {
    db.Room.create({
      user_id1: req.body.user_id1,
      user_id2: null
    }).then(function(dbExample) {
      res.json(dbExample);
    });
  });

  app.put("/api/rooms/:id", function(req, res) {
    db.Room.update(req.body, {
      where: {
        id: req.params.id
      }
    }).then(function(updateRoom) {
      res.json(updateRoom);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(
      dbExample
    ) {
      res.json(dbExample);
    });
  });
};
