import {
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
  verifyToken,
} from "./../middleware/authJwt.js";

import db from "../models/index.js";
import {
  moveStrang,
  breakStrangByID,
  ValveState,
} from "../gpio/strang.gpio.js";

const strangs = db.strang;
const rooms = db.room;
const thermostats = db.thermostat;

export var strangState = {
  enabled: 1,
  disabled: 0,
  movingUp: 2,
  movingDown: 4,
};

function getAll(req, res) {
  res.status(200).send("Public Content.");
}

async function openStrangRequest(req, res) {
  const strangID = req.query.strangID;
  const stepSize = req.query.stepSize;

  console.log("strangID ", JSON.stringify(req.query.strangID));
  strangs
    .findOne({
      where: { id: strangID },
    })
    .then((strang) => {
      moveStrang(strang, ValveState.open, stepSize);
      res.status(200).send("Down .");
    })
    .catch((err) => {
      console.log("error on loading room", err);
      res.status(200).send("Error", err);
      return;
    });
}

async function closeStrangRequest(req, res) {
  const strangID = req.query.strangID;
  const stepSize = req.query.stepSize;
  strangs
    .findOne({
      where: { id: strangID },
    })
    .then((strang) => {
      moveStrang(strang, ValveState.close, stepSize);
      res.status(200).send("Down .");
    })
    .catch((err) => {
      console.log("error on loading room", err);
      res.status(200).send("Error", err);
      return;
    });
}

async function breakStrangRequest(req, res) {
  console.log("strangID ", JSON.stringify(req.query.strangID));
  const strangID = req.query.strangID;
  const strang = await strangs.findOne({
    where: { id: strangID },
  });
  const close = req.query.close;
  const newStrangPos = breakStrangByID(
    strang,
    close ? ValveState.close : ValveState.open,
  );
  res.status(200).send(JSON.stringify(newStrangPos));
}

async function setZero(req, res) {
  console.log("strangID ", JSON.stringify(req.query.strangID));
  const strangID = req.query.strangID;
  const strang = await strangs.findOne({
    where: { id: strangID },
  });
  strang.currentPos = 0;
  await strang.save();
  res.status(200).send(JSON.stringify(strang.currentPos));
}

async function setMax(req, res) {
  console.log("strangID ", JSON.stringify(req.query.strangID));
  const strangID = req.query.strangID;
  const strang = await strangs.findOne({
    where: { id: strangID },
  });
  strang.maxPos = strang.currentPos;
  await strang.save();
  res.status(200).send(JSON.stringify(strang.currentPos));
}

async function getPos(req, res) {
  console.log("strangID ", JSON.stringify(req.query.strangID));
  const strangID = req.query.strangID;
  const strang = await strangs.findOne({
    where: { id: strangID },
  });
  await strang.save();
  res.status(200).send(JSON.stringify(strang.currentPos));
}

async function enableStrang(req, res) {
  console.log("enable strang", req.query);
  const roomID = req.query.roomID;
  const strangID = req.query.strangID;
  const state = req.query.enable ? strangState.enabled : strangState.disabled;
  console.log(" strang id", strangID, " state ", state);
  const strang = await strangs.findOne({
    where: { id: strangID },
  });
  strang.state = state;
  await strang.save();

  const room = await rooms.findOne({
    where: { user_id: req.userId, id: roomID },
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: strangs,
        as: "strangs",
        attributes: ["id", "name", "pin1", "pin2", "currentPos", "state"], // Only select needed fields
      },
    ],
  });

  console.log(
    "JSON.stringify(roomsWithStrangs):",
    JSON.stringify(room.strangs),
  );

  res.status(200).send(JSON.stringify(room));
  //openStrang(strang, enabled === 1 ? ValveState.open : ValveState.close);
}

async function setStrangPos(req, res) {
  console.log("set strang pos", req.query);
  const roomID = req.query.roomID;
  const strangID = req.query.strangID;
  const newPos = req.query.pos;
  console.log(" strang id", strangID, " new Pos ", newPos);
  const strang = await strangs.findOne({
    where: { id: strangID },
  });
  strang.state = 2;
  await strang.save();

  const room = await rooms.findOne({
    where: { user_id: req.userId, id: roomID },
    include: [
      {
        model: thermostats,
        as: "thermostats",
        attributes: ["id", "name", "temperature", "humidity"], // Only select needed fields
      },
      {
        model: strangs,
        as: "strangs",
        attributes: ["id", "name", "pin1", "pin2", "currentPos", "state"], // Only select needed fields
      },
    ],
  });

  console.log(
    "JSON.stringify(roomsWithStrangs):",
    JSON.stringify(room.strangs),
  );

  res.status(200).send(JSON.stringify(room));
  //openStrang(strang, enabled === 1 ? ValveState.open : ValveState.close);
}

export default function strangRoutes(app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.get("/api/test//strang", [verifyToken], getAll);

  app.get("/api/test/open", [verifyToken], openStrangRequest);

  app.get("/api/test/close", [verifyToken], closeStrangRequest);

  app.get("/api/test/break", [verifyToken], breakStrangRequest);
  app.get("/api/test/setZero", [verifyToken], setZero);
  app.get("/api/test/setMax", [verifyToken], setMax);
  app.get("/api/test/getPos", [verifyToken], getPos);

  app.get("/api/test/enableStrang", [verifyToken], enableStrang);

  app.get("/api/test/setStrangPos", [verifyToken], setStrangPos);
}
