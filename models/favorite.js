module.exports = function(sequelize, DataTypes) {
    var Favorite = sequelize.define("Favorite", {
      user_id1: DataTypes.INTEGER
      user_id2: DataTypes.INTEGER
      is_match: DataTypes.BOOLEAN
    });
    return Example;
  };