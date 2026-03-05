import db from "../models/index.js";
import rpio from "rpio";
import { exec } from "node:child_process";
import { strangState } from "../routes/strang.routes.js";

const strangs = db.strang;

export const ValveState = {
  open: 1,
  close: 2,
};

export async function openStrangByID(strangID, valveState, stepSize) {
  console.log("strangID ", strangID);

  const strang = await strangs.findOne({
    where: { id: strangID },
  });

  moveStrang(strang, valveState, stepSize);
}

export async function breakStrangByID(strang, valveState) {
  console.log("strangID ", strang.id);
  return breakStrang(strang, valveState);
}

async function safeImport(modulePath) {
  try {
    // Attempt to dynamically import the module
    const module = await import(modulePath);
    console.log(`✅ Successfully imported: ${modulePath}`);
    return module;
  } catch (err) {
    if (
      err.code === "ERR_MODULE_NOT_FOUND" ||
      err.message.includes("Cannot find module")
    ) {
      console.warn(`⚠️ Module not found: ${modulePath}`);
      return null; // Return null if module doesn't exist
    }
    // Re-throw unexpected errors
    throw err;
  }
}

export const maxTIME = 10000;

export async function moveStrang(strang, valveState, stepSize) {
  console.log("strang ", JSON.stringify(strang));
  if (stepSize === null) stepSize = maxTIME;
  if (strang.state === 0 && valveState === ValveState.open) return;

  goToStrangPosPinCtrl(strang, valveState === ValveState.open, stepSize);
}

export async function breakStrang(strang, valveState) {
  const result = Date.parse(strang.updatedAt);
  let sinceUpdate = Date.now() - result;
  set2PinLow(strang.pin1, strang.pin2);
  console.log("break time ", sinceUpdate, " up / down ", valveState);

  if (strang.state === strangState.movingDown) {
    foundStrang.currentPos + sinceUpdate;
  } else {
    if (strang.state === strangState.movingUp) {
      foundStrang.currentPos - sinceUpdate;
    } else return;
  }
  strang.state = strangState.enabled;

  await strang.save();
  return strang.currentPos;
}

export async function goToStrangPosPinCtrl(strang, down, stepTime) {
  console.log(
    "goToStrangPosPinCtrl strang id ",
    strang.id,
    " down ",
    down,
    " stepTime ",
    stepTime,
  );

  try {
    console.log("set rpio hiw");
    /*
    if (down) strang.currentPos += stepTime;
    else {
      strang.currentPos -= stepTime;
      if (strang.currentPos < 0) strang.currentPos = 0;
    }*/
    strang.state =
      down === true ? strangState.movingDown : strangState.movingUp;
    console.log("setting strang.state  ", strang.state);
    await strang.save();

    if (down) {
      setPin(strang.pin1, true);
      setPin(strang.pin2, false);
    } else {
      setPin(strang.pin1, false);
      setPin(strang.pin2, true);
    }

    console.log("start timer ");
    setTimeout(
      (pin1 = strang.pin1, pin2 = strang.pin2, strangID = strang.id) => {
        const nowItIs = Date.now();
        set2PinLow(pin1, pin2);

        strangs
          .findOne({
            where: { id: strangID },
          })
          .then((foundStrang) => {
            const result = Date.parse(strang.updatedAt);
            let sinceUpdate = nowItIs - result;
            console.log("foundStrang.state  ", foundStrang.state);
            if (foundStrang.state === strangState.movingDown) {
              //console.log("was set to move down  ");
              foundStrang.currentPos = foundStrang.currentPos + sinceUpdate;
            } else {
              if (foundStrang.state === strangState.movingUp) {
                //console.log("was set to move up  ");
                foundStrang.currentPos = foundStrang.currentPos - sinceUpdate;
                if (foundStrang.currentPos < 0) foundStrang.currentPos = 0;
              } else return;
            }
            foundStrang.state = strangState.enabled;
            //console.log("foundStrang  ", JSON.stringify(foundStrang));
            foundStrang.save();
            console.log("strang updated... yeah msec ", sinceUpdate);
          });
      },
      stepTime,
    );
  } catch (err) {
    console.log("Using fallback behavior...", err);
    //strang.currentPos = valveState === ValveState.open ? 10000 : 0;
    //strang.save();
  }
}

const setPin = (pin, high) => {
  const cmd = "sudo pinctrl set " + pin + " op d" + (high ? "h" : "l");
  console.log("exec cmd ", cmd);
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
};

const set2PinLow = (pin1, pin2) => {
  const cmd = "sudo pinctrl set " + pin1 + "," + pin2 + " op dl";
  console.log("exec cmd ", cmd);
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
};
