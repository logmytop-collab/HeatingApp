import { verifyToken } from "./../middleware/authJwt.js";

import db from "../models/index.js";

const rooms = db.room;
const strangs = db.strang;
const thermostats = db.thermostat;

async function getAll(req, res) {
  const roomsWithStrangs = await rooms.findAll({
    where: { user_id: req.userId },
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: strangs,
        as: "strangs",
        attributes: [
          "id",
          "name",
          "pin1",
          "pin2",
          "currentPos",
          "maxPos",
          "state",
        ], // Only select needed fields
      },
    ],
  });

  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(roomsWithStrangs));

  res.status(200).send(JSON.stringify(roomsWithStrangs));
}

async function getSingleRoom(req, res) {
  console.log("query parameter getSingleRoom ", JSON.stringify(req.query));
  const room = await rooms.findOne({
    where: { user_id: req.userId, id: req.query.id },
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: strangs,
        as: "strangs",
        attributes: [
          "id",
          "name",
          "pin1",
          "pin2",
          "currentPos",
          "maxPos",
          "state",
        ], // Only select needed fields
      },
    ],
  });

  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(room));

  res.status(200).send(JSON.stringify(room));
}

async function setRoomTemperature(req, res) {
  console.log("query setRoomTemperature ", JSON.stringify(req.query));

  const targetTemperature = req.query.temp;
  const id = req.query.id;

  console.log("targetTemperature ", JSON.stringify(req.query.temp));
  console.log("targetTemperature ", JSON.stringify(targetTemperature));
  /*
  const [updatedCount] = await rooms.update(
    {
      targetTemperature: { targetTemperature },
      updatedAt: db.sequelize.literal("CURRENT_TIMESTAMP"),
    },
    { where: { id } },
  );
*/
  const room = await rooms.findOne({
    where: { user_id: req.userId, id: req.query.id },
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: strangs,
        as: "strangs",
        attributes: ["id", "name", "pin1", "pin2", "currentPos", "maxPos"], // Only select needed fields
      },
    ],
  });

  room.targetTemperature = Number(targetTemperature);
  console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(room));
  await room.save();
  console.log("after save");
  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(room));

  res.status(200).send(JSON.stringify(room));
}

async function updateRoomName(req, res) {
  console.log("query updateRoomName ", JSON.stringify(req.query));

  const name = req.query.name;
  const id = req.query.id;

  console.log("new name ", JSON.stringify(req.query.name));

  const room = await rooms.findOne({
    where: { user_id: req.userId, id: req.query.id },
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: strangs,
        as: "strangs",
        attributes: [
          "id",
          "name",
          "pin1",
          "pin2",
          "currentPos",
          "maxPos",
          "state",
        ], // Only select needed fields
      },
    ],
  });

  room.name = name;
  await room.save();

  //console.log("JSON.stringify(roomsWithStrangs):", JSON.stringify(room));

  res.status(200).send(JSON.stringify(room));
}

export default function roomRoutes(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.get("/api/test/rooms", [verifyToken], getAll);

  app.get("/api/test/room", [verifyToken], getSingleRoom);

  app.get("/api/test/setRoomTemp", [verifyToken], setRoomTemperature);

  app.get("/api/test/updateRoomName", [verifyToken], updateRoomName);
}
