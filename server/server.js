// server.js (MariaDB + Express.js API)

// **********************************************
// 1. MODULE IMPORTIEREN
// **********************************************
import express, { json } from "express";
import { createPool } from "mariadb";
import cors from "cors"; // important for the frontend
import { hashSync } from "bcryptjs";

import userRoutes from "./app/routes/user.routes.js"; // important for the frontend
import authRoutes from "./app/routes/auth.routes.js";
import roomRoutes from "./app/routes/room.routes.js";
import strangRoutes from "./app/routes/strang.routes.js";

import { checkStrangs } from "./app/models/room.helper.js";

import db from "./app/models/index.js";
import thermostatRoutes from "./app/routes/thermostat.routes.js";
import setUpMqtt from "./app/models/themperature.helper.js";
import { or } from "sequelize";
import { setAllPinsLowMqtt } from "./app/gpio/strang.gpio.js";

// **********************************************
// 2. KONFIGURATION
// **********************************************
const app = express();

async function initial() {
  const Role = db.role;
  const User = db.user;
  const Room = db.room;
  const Strang = db.strang;
  const Thermostat = db.thermostat;
  Role.create({
    id: 1,
    name: "user",
  });

  Role.create({
    id: 2,
    name: "moderator",
  });

  Role.create({
    id: 3,
    name: "admin",
  });

  const bedRoom2 = await Room.create(
    {
      name: "Büro",
      size: 20,
      temperature: 23,
      targetTemperature: 20,
      strangs: [
        { name: "Strang 02", pin1: 19, pin2: 26, currentPos: 0, state: 1 },
      ],
      thermostats: [{ name: "Paco", deviceID: "0xa4c138016a3bffff" }],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );

  const bedRoom1 = await Room.create(
    {
      name: "Schlafzimmer",
      size: 20,
      temperature: 23,
      targetTemperature: 20,
      strangs: [
        { name: "Strang 01", pin1: 12, pin2: 16, currentPos: 0, state: 1 },
      ],
      thermostats: [{ name: "Schlafzimmer"}],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );
  const kitchen = await Room.create(
    {
      name: "Wohnzimmer",
      size: 20,
      targetTemperature: 20,
      temperature: 23,
      strangs: [
        { name: "Strang 03", pin1: 21, pin2: 20, currentPos: 0, state: 1 },
        { name: "Strang 04", pin1: 11, pin2: 25, currentPos: 0, state: 1 },
        { name: "Strang 05", pin1: 10, pin2: 22, currentPos: 0, state: 1 },
      ],
      thermostats: [{ name: "thermo 06", deviceID: "0xa49e69fffe6daa28" }],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );
  const bathRoom = await Room.create(
    {
      name: "Bad",
      size: 20,
      targetTemperature: 20,
      temperature: 23,
      strangs: [
        { name: "Strang 06", pin1: 23, pin2: 24, currentPos: 0, state: 1 },
      ],
      thermostats: [{ name: "thermo 09", deviceID: "0xf4b3b1fffe4e807d" }],
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );

  const toilette = await Room.create(
    {
      name: "Toilette",
      size: 20,
      targetTemperature: 20,
      temperature: 23,
      strangs: [
        {
          name: "Strang 08",
          pin1: 27,
          pin2: 17,
          currentPos: 0,
          maxPos: 6000,
          state: 1,
        },
      ],
      thermostats: [{ name: "Toilette", deviceID: "0xf4b3b1fffe52241d" }], //
    },
    {
      include: [
        { model: Strang, as: "strangs" },
        { model: Thermostat, as: "thermostats" },
      ], // Required for nested insert
    },
  );

  const usr = await User.create({
    username: "admin",
    password: hashSync("admin"),
  });

  //usr.rooms
  console.log("update room ", bedRoom1.id, " usr.id ", usr.id);
  const saved1 = await bedRoom1.setUser(usr);
  const saved2 = await bedRoom2.setUser(usr);
  const saved3 = await kitchen.setUser(usr);
  const saved4 = await bathRoom.setUser(usr);
  const saved5 = await toilette.setUser(usr);

  /*
  try {
    const updated = await Room.update(
      { user_id: usr.id },
      { where: { id: aRoom.id } }
    );
    console.log("update room", updated);
  } catch (err) {
    console.error(err);
  }*/
}

const intervalMs = 60 * 1000;

const callSetupMQTT = () => {
  console.log("before await setUpMqtt();");
  setUpMqtt().then();
};

const runThempCheckTimer = () => {
  //setTimeout(periodicTempCheck, intervalMs);
};

async function periodicTempCheck() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Running temp check ...`);
  const strangs = db.strang;
  const thermostats = db.thermostat;
  const roomsWithStrangs = await db.room.findAll({
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

  console.log("rooms ...", JSON.stringify(roomsWithStrangs));
  roomsWithStrangs.forEach((room) => {
    checkStrangs(room);
  });
  runThempCheckTimer();
  // Your logic here (e.g., cleanup, database update, API call)
}

// MariaDB Verbindungspool

// **********************************************
// 3. MIDDLEWARE & DATENBANK-SETUP
// **********************************************

var whitelist = [
  "http://localhost:3000",
  "http://server_api:5000",
  "http://172.20.0.5",
  "http://192.168.178.85",
]; //white list consumers

var corsOptions = {
  origin: function (origin, callback) {
    console.log("white list origin ?? ", origin);
    for (let i = 0; i < whitelist.length; i++) {
      if (origin.indexOf(whitelist[i]) >= 0) {
        console.log("yeah ", origin);

        callback(null, true);
        return;
      }
    }
    console.log("ups no  ", origin);
    callback(null, false);
  },
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: [
    "x-access-token",
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
  ],
};

app.use(cors(corsOptions)); // permits the access to the index.html
app.use(json()); // Erlaubt das Verarbeiten von JSON-Daten im Request Body

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
console.log("sleep 5000 ");
await delay(5000);
console.log("sync Db");

const initialize = false;

await db.sequelize.sync({ alter: !initialize, force: initialize }).then(() => {
  if (initialize)
  {
    console.log("Drop and Resync Db");
    initial();

  }
});

//console.log("before await setUpMqtt();");
//await setUpMqtt();
//console.log("after await setUpMqtt();");
// Run the task every 10 seconds (10000 ms)
runThempCheckTimer();

//db.sequelize.sync();

// **********************************************
// 4. EXPRESS ROUTING (API-ENDPUNKTE)
// **********************************************

// --- 4a. Basis Test-Endpunkt ---
app.get("/", (req, res) => {
  res.send(`<h1>Express API läuft!</h1> Verbunden mit MariaDB an Port.`);
});

authRoutes(app);
userRoutes(app);
thermostatRoutes(app);
roomRoutes(app);
strangRoutes(app);

// --- 4b. API-Endpunkt zum Abrufen aller Benutzer (Beispiel: SELECT) ---
// ANNAHME: Sie haben eine Tabelle 'users' in Ihrer DB
app.get("/api/briefe", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Führt die SQL-Abfrage aus
    const rows = await conn.query(
      "SELECT id, Firma, Strasse, PLZ, Stadt, Datum, Ansprechpartner, Betreff FROM Briefe",
    );

    res.json({
      anzahl: rows.length,
      ergebnisse: rows,
    });
  } catch (error) {
    console.error("MariaDB Abfragefehler:", error);
    res.status(500).json({
      message: "Fehler beim Abrufen der Benutzerdaten.",
      error: error.message,
    });
  } finally {
    if (conn) conn.release(); // Verbindung freigeben ist obligatorisch!
  }
});

setTimeout(setUpMqtt, 10000);

setTimeout(() => {
  setAllPinsLowMqtt();
}, 15000);

// **********************************************
// 5. SERVER STARTEN
// **********************************************

const port = 5000;

app.listen(port, () => {
  console.log(`🚀 Server gestartet auf http://localhost:${port}`);
});
