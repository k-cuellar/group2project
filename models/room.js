module.exports = function(sequelize, DataTypes) {
  var Room = sequelize.define("Room", {
    user_id1: DataTypes.INTEGER,
    user_id2: DataTypes.INTEGER
  });
  return Room;
};
