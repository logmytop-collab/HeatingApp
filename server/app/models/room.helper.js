import db from "../models/index.js";
import { moveStrang } from "../gpio/strang.gpio.js";

const strangs = db.strang;
const rooms = db.room;

export const checkStrangs = (room) => {
  let temp = 0;
  if (room.thermostats.length === 0) return;

  room.thermostats.forEach((therm) => {
    try {
      therm.name;
    } catch (exc) {}

    temp += therm.temperature;
  });
  temp /= room.thermostats.length;

  console.log(
    "temperature room ",
    room.name,
    " is ",
    temp,
    " target temp = ",
    room.targetTemperature,
  );

  if (temp != room.temperature);
  {
    room.temperature = temp;
    room.save();
    if (temp < room.targetTemperature) {
      // heating
      room.strangs.forEach((strang) => {
        moveStrang(strang, true);
      });
    } else {
      room.strangs.forEach((strang) => {
        moveStrang(strang, false);
      });
    }
  }
};
