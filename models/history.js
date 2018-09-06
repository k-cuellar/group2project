module.exports = function(sequelize, DataTypes) {
  var History = sequelize.define("History", {
    user_id1: DataTypes.INTEGER,
    user_id2: DataTypes.INTEGER,
    date_matched: DataTypes.DATE
  });
  return History;
};
