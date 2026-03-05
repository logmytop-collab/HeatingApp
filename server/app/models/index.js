import {
  DB,
  USER,
  PASSWORD,
  HOST,
  dialect as _dialect,
  pool as _pool,
} from "../config/db.config.js";

import Role from "./role.model.js";
import User from "./user.model.js";
import Strang from "./strang.model.js";
import Sequelize from "sequelize";
import Room from "./room.model.js";
import Thermostat from "./thermostat.model.js";

console.log("config.DB ", DB);

const sequelize = new Sequelize(DB, USER, PASSWORD, {
  host: HOST,
  dialect: _dialect,
  pool: {
    max: _pool.max,
    min: _pool.min,
    acquire: _pool.acquire,
    idle: _pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = User(sequelize, Sequelize);
db.role = Role(sequelize, Sequelize);
db.room = Room(sequelize, Sequelize);
db.thermostat = Thermostat(sequelize, Sequelize);
db.strang = Strang(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
});

db.user.hasMany(db.room, { foreignKey: "user_Id", as: "rooms" });
db.room.belongsTo(db.user, { foreignKey: "user_Id", as: "user" });

db.room.hasMany(db.thermostat, { foreignKey: "room_Id", as: "thermostats" });
db.thermostat.belongsTo(db.room, { foreignKey: "room_Id", as: "room" });

db.room.hasMany(db.strang, { foreignKey: "room_Id", as: "strangs" });
db.strang.belongsTo(db.room, { foreignKey: "room_Id", as: "room" });


db.ROLES = ["user", "admin", "moderator"];

export default db;
