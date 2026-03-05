import {
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
  verifyToken,
} from "./../middleware/authJwt.js";
import db from "../models/index.js";
const rooms = db.room;
const strangs = db.strang;
const thermostats = db.thermostat;

async function getAll(req, res) {
  const ret = "";
  console.log("getAll(req, res)", req.userId);
  //res.status(200).send("get all thermostats user id " + req.userId);

  const userThermostats = await thermostats.findAll({
    include: [
      {
        where: { user_id: req.userId },
        model: rooms,
        as: "room",
        attributes: ["id", "user_id", "name"], // Only select needed fields
        include: [
          {
            model: strangs,
            as: "strangs",
            attributes: ["id", "name", "pin1", "pin2"], // Only select needed fields
          }
        ],
      },
    ],
  });

  console.log("Fetched userThermostats with posts:", JSON.stringify(userThermostats));

  return res.status(200).send(JSON.stringify(userThermostats));
  console.log("userThermostats:");
}

export default function thermostatRoutes(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.get("/api/test/thermostat", [verifyToken], getAll);
}
