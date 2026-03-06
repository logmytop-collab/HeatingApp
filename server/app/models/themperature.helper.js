import mqtt from "mqtt";
import db from "../models/index.js";
import { Op } from "sequelize";
import {
  goToStrangPosPinCtrl,
  maxTIME,
  ValveState,
} from "../gpio/strang.gpio.js";

const thermostats = db.thermostat;
const room = db.room;
const strangs = db.strang;

const options = {
  clientId: "Icke",
  Username: "markus",
  Password: "markus",
  clean: true,
};

//let client = mqtt.connect("mqtt://127.0.0.1:1883", options);
//let client = mqtt.connect("mqtt://172.20.0.3:1883", options);
let client = mqtt.connect("mqtt://mosquitto:1883", options);
//let client = mqtt.connect("mqtt://mqtt:1883", options);

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

const updateRoomStrangs = async (roomID) => {
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
          attributes: ["id", "name", "pin1", "pin2", "currentPos", "staTE"], // Only select needed fields
        },
      ],
    })
    .then((foundRoom) => {
      console.log("found room yeah ");
      if (foundRoom.thermostats.length === 0) {
        console.log("no thermostat found");
        return;
      }
      var currentTemperature = 0;
      for (var i = 0; i < foundRoom.thermostats.length; i++) {
        currentTemperature += foundRoom.thermostats[i];
      }
      currentTemperature /= foundRoom.thermostats.length;
      if (currentTemperature < foundRoom.targetTemperature) {
        for (var i = 0; i < foundRoom.strangs.length; i++) {
          goToStrangPosPinCtrl(foundRoom.strangs[i], maxTIME);
        }
      } else {
        for (var i = 0; i < foundRoom.strangs.length; i++) {
          goToStrangPosPinCtrl(foundRoom.strangs[i], 0);
        }
      }
    })
    .catch((err) => {
      console.log("error on loading room", err);
    });
};

const setUpMqtt = () => {
  console.log("in setUpMqtt() ");

  client.on("connect", () => {
    console.log("connected ... ");

    client.subscribe("presence", (err) => {
      if (!err) {
        client.publish("presence", "Hello mqtt");
      }
    });

    console.log("client.subscribe('sensor/temperature')");
  });

  const topic = "/sensors/temperature";

  client.subscribe("zigbee2mqtt/Toilette");
  console.log('twice client.subscribe("zigbee2mqtt/Toilette")');

  getDevIDs().then((names) => {
    console.log("got names ", names.join("-"));
    names.forEach((name) => {
      const subText = "zigbee2mqtt/" + name;
      client.subscribe(subText);
      console.log("subsribe text ", subText);
    });
  });

  client.publish(topic, "payload", { qos: 1 }, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("published");
  });

  client.on("message", (topic, message) => {
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

                updateRoomStrangs(foundTherma.room.id);
              })
              .catch((err) => {
                console.log("error on saved temperature ", err);
              });

            console.log("json Temperature ", dataJson.temperature);
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
  client.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
};

export default setUpMqtt;
