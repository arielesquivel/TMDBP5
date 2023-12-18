const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require("../db/db");
const bcrypt = require("bcrypt");

class User extends Model {
  async Hash(password) {
    const salt = await bcrypt.genSalt(8);
    this.salt = salt;
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async validatePassword(password) {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "user",
  }
);

User.beforeCreate(async (user) => {
  const hash = await user.Hash(user.password);
  user.password = hash;
});

module.exports = User;
