var db = require("../models");

module.exports = function (app) {
  // gets the first available room with a user in it that I have not already matched with
  app.get("/api/rooms", function (req, res) {
    //THIS GRABS THE CURRENT USERS UNIQUE ID FROM GOOGLE ID TABLE
    var myUser = req.user.dataValues.id;
    db.sequelize
      .query(
        "select id, user_id1 from rooms where user_id2 is null and user_id1 not in (select user_id1 from histories where user_id2 = ? union all select user_id2 from histories where user_id1 = ?) limit 1",
        { replacements: [myUser, myUser] }
      )
      .then(function (firstRoom) {
        res.json(firstRoom);

        //CONSOLE LOGS GOOGLE USER INFO IN TERMINAL
        console.log(req.user.dataValues);
      });
  });

  // create an empty room if one doesn't exist above
  app.post("/api/rooms", function (req, res) {
    db.Room.create({
      user_id1: req.body.user_id1,
      user_id2: null
    }).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  app.put("/api/rooms/:id", function (req, res) {
    db.Room.update(req.body, {
      where: {
        id: req.params.id
      }
    }).then(function (updateRoom) {
      res.json(updateRoom);
    });
  });

  //Grabs user's unique id based on google id
  app.get("/api/users/me", function (req, res) {
    if (req.user) {
      res.json(req.user);
    } else {
      res.sendStatus(204);
    }
  });

  // Delete a room by id
  app.delete("/api/rooms/:room_id", function (req, res) {
    db.Room.destroy({
      where: {
        id: req.params.room_id
      }
    }).then(function (rmRoom) {
      res.json(rmRoom);
    });
  });

  app.delete("/api/users/:id", function (req, res) {
    db.Room.destroy({ where: { user_id1: req.params.id } }).then(function (
      deleteRoom
    ) {
      res.json(deleteRoom);
    });
  });

  // get the favorites if either user has favorited the other
  app.get("/api/favorites/:user_id1/:user_id2", function (req, res) {
    db.sequelize
      .query(
        "select id from favorites where (user_id1 = ? and user_id2 = ?) or (user_id1 = ? and user_id2 = ?)",
        {
          replacements: [
            req.params.user_id1,
            req.params.user_id2,
            req.params.user_id2,
            req.params.user_id1
          ]
        }
      )
      .then(function (isFav) {
        res.json(isFav);
      });
  });

  // if we find a row returned from above, update the is_match value to 1
  app.put("/api/favorites", function (req, res) {
    db.Favorite.update(req.body, {
      where: {
        id: req.body.id
      }
    }).then(function (updateFav) {
      res.json(updateFav);
    });
  });

  // post route for adding a new favorite
  app.post("/api/favorites", function (req, res) {
    db.Favorite.create({
      user_id1: req.body.user_id1,
      user_id2: req.body.user_id2,
      is_match: 0
    }).then(function (newFav) {
      res.json(newFav);
    });
  });


};
