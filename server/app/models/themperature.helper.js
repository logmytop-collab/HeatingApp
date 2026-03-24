import mqtt from "mqtt";
import db from "../models/index.js";
import { Op } from "sequelize";
import {
  goToStrangPosPinCtrl,
  maxTIME,
  moveMax,
  moveZero,
} from "../gpio/strang.gpio.js";

import { mqttClient } from "../mytt/mqtt.helper.js";
import Logdata from "./logdata.model.js";

const thermostats = db.thermostat;
const room = db.room;
const strangs = db.strang;
const logdatas = db.logdata;

//let mqttClient = mqtt.connect("mqtt://127.0.0.1:1883", options);
//let mqttClient = mqtt.connect("mqtt://172.20.0.3:1883", options);
//let mqttClient = mqtt.connect("mqtt://mosquitto:1883", options);
//let mqttClient = mqtt.connect("mqtt://mqtt:1883", options);

const getDevIDs = async () => {
  const ret = [];
  const allThemos = await thermostats.findAll();
  allThemos.forEach((thermo) => {
    if (thermo.name) {
      ret.push(thermo.name);
    }
    if (thermo.deviceID) ret.push(thermo.deviceID);
  });
  console.log("device names  ", ret.join(","));
  return ret;
};

const updateRoomStrangsByID = async (roomID) => {
  room
    .findOne({
      where: { id: roomID },
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
            "staTE",
          ], // Only select needed fields
        },
      ],
    })
    .then((foundRoom) => {
      console.log("found room yeah ");
      updateRoom(foundRoom);
    })
    .catch((err) => {
      console.log("error on loading room", err);
    });
};

export const updateRoom = async (room) => {
  if (room.thermostats.length === 0) {
    console.log("no thermostat found");
    return;
  }
  var currentTemperature = 0;
  for (var i = 0; i < room.thermostats.length; i++) {
    currentTemperature += room.thermostats[i].temperature;
  }
  currentTemperature /= room.thermostats.length;
  console.log(
    "currentTemperature ",
    currentTemperature,
    " foundRoom.targetTemperature ",
    room.targetTemperature,
  );
  if (currentTemperature < room.targetTemperature) {
    for (var i = 0; i < room.strangs.length; i++) {
      moveMax(room.strangs[i]);
    }
  } else {
    for (var i = 0; i < room.strangs.length; i++) {
      moveZero(room.strangs[i]);
    }
  }
};

const setUpMqtt = () => {
  console.log("in setUpMqtt() ");

  mqttClient.on("connect", () => {
    console.log("connected ... ");

    mqttClient.subscribe("presence", (err) => {
      if (!err) {
        mqttClient.publish("presence", "Hello mqtt");
      }
    });

    console.log("mqttClient.subscribe('sensor/temperature')");
  });

  const topic = "/sensors/temperature";

  mqttClient.subscribe("zigbee2mqtt/Toilette");
  console.log('twice mqttClient.subscribe("zigbee2mqtt/Toilette")');

  getDevIDs().then((names) => {
    console.log("got names ", names.join("-"));
    names.forEach((name) => {
      const subText = "zigbee2mqtt/" + name;
      mqttClient.subscribe(subText);
      console.log("subsribe text ", subText);
    });
  });

  mqttClient.publish(topic, "payload", { qos: 1 }, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("published");
  });

  mqttClient.on("message", (topic, message) => {
    // message is Buffer
    console.log("mqtt message topic ", topic);
    console.log("mqtt message");
    console.log(message.toString());
    if (topic.startsWith("zigbee2mqtt")) {
      const topicSplit = topic.split("/");
      console.log("update temperature", topicSplit.join("."));
      if (topicSplit.length != 2) return;
      const dataJson = JSON.parse(message.toString());
      //console.log("dataJson ", dataJson);
      //console.log("dataJson ", JSON.parse(dataJson));

      if (dataJson.temperature)
        console.log("json Temperature ", dataJson.temperature);
      if (dataJson.humidity) console.log("json humidity ", dataJson.humidity);
      const deviceNameID = topicSplit[1];
      console.log("update temperature ", deviceNameID);

      thermostats
        .findOne({
          where: {
            [Op.or]: [{ name: deviceNameID }, { deviceID: deviceNameID }],
          },
          include: [
            {
              model: room,
              as: "room",
              attributes: ["id", "name", "temperature"], // Only select needed fields
              include: [
                {
                  model: strangs,
                  as: "strangs",
                  attributes: [
                    "id",
                    "name",
                    "pin1",
                    "pin2",
                    "currentPos",
                    "state",
                    "maxPos",
                  ], // Only select needed fields
                },
              ],
            },
          ],
        })
        .then((foundTherma) => {
          console.log("found Thermostate ", JSON.stringify(foundTherma));
          try {
            foundTherma.temperature = dataJson.temperature;
            foundTherma.humidity = dataJson.humidity;
            foundTherma.battery = dataJson.battery;
            foundTherma
              .save()
              .then(() => {
                console.log("saved temperature ");

                updateRoomStrangsByID(foundTherma.room.id);
                console.log("saved temperature ");
                const Logdata = db.logdata;
            const log = Logdata.create({
              temperature: dataJson.temperature,
              humidity: dataJson.humidity,
              thermostat_Id: foundTherma.id,
            }).then(() => {
              console.log("saved logdata ");
            });
              })
              .catch((err) => {
                console.log("error on saved temperature ", err);
              });

          } catch (exc) {
            console.log("no error on update temperature");
          }
        })
        .catch((err) => {
          console.log("error on update temperature", err);
        });
    }
  });

  // error handling
  mqttClient.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
};

export default setUpMqtt;
