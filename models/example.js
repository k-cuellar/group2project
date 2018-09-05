module.exports = function(sequelize, DataTypes) {
  // var Example = sequelize.define("Example", {
  //   text: DataTypes.STRING,
  //   description: DataTypes.TEXT
  // });
  // return Example;

  var User = sequelize.define("User", {
    googleId: DataTypes.STRING
  });
  return User;
};
