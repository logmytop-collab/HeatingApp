import axios from "axios";
import authHeader from "./auth-header";
import { SERVER_API_URL } from "./config";

export const SERVER_USER_API_URL = SERVER_API_URL + "/api/test/";

export type userType = {
  username: string;
  accessToken: string;
  id: number;
  email: string;
  roles: string[];
};

class UserService {
  getPublicContent() {
    return axios.get(SERVER_USER_API_URL + "all");
  }

  getUserBoard() {
    return axios.get(SERVER_USER_API_URL + "user", { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(SERVER_USER_API_URL + "mod", { headers: authHeader() });
  }

  getThermostatBoard() {
    console.log("getThermostatBoard");
    return axios.get(SERVER_USER_API_URL + "thermostat", { headers: authHeader() });
  }

  getRoomBoard() {
    console.log("getRoomBoard");
    return axios.get(SERVER_USER_API_URL + "rooms", { headers: authHeader() });
  }

  getRoom(id: any) {
    console.log("getRoom ", id);
    return axios.get(SERVER_USER_API_URL + "room?id=" + id, { headers: authHeader() });
  }

  saveTargetTemp(room_id: any, targetTemp: number) {
    const url = SERVER_USER_API_URL + "setRoomTemp?id=" + room_id + "&temp=" + targetTemp;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  enableStrang(room_id: any, strangID: any, enabled: number) {
    const url =
      SERVER_USER_API_URL +
      "enableStrang?roomID=" +
      room_id +
      "&strangID=" +
      strangID +
      "&enable=" +
      enabled;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  setStrangPos(room_id: any, strangID: any, pos: number) {
    const url =
      SERVER_USER_API_URL +
      "setStrangPos?roomID=" +
      room_id +
      "&strangID=" +
      strangID +
      "&pos=" +
      pos;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  openCloseStrang(
    room_id: any,
    strangID: any,
    open: boolean,
    stepSize: Number,
  ) {
    const url =
      SERVER_USER_API_URL +
      (open ? "open" : "close") +
      "?roomID=" +
      room_id +
      "&strangID=" +
      strangID +
      "&stepSize=" +
      stepSize;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  breakStrangAtPos(room_id: any, strangID: any, open: boolean) {
    const url =
      SERVER_USER_API_URL +
      "break?roomID=" +
      room_id +
      "&strangID=" +
      strangID +
      (open ? "&open=true" : "");
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  setZeroStrang(strangID: any) {
    const url = SERVER_USER_API_URL + "setZero?strangID=" + strangID;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  moveZeroStrang(strangID: any) {
    const url = SERVER_USER_API_URL + "moveZero?strangID=" + strangID;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  moveMaxStrang(strangID: any) {
    const url = SERVER_USER_API_URL + "moveMax?strangID=" + strangID;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  setMaxStrang(strangID: any) {
    const url = SERVER_USER_API_URL + "setMax?strangID=" + strangID;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  getPosStrang(strangID: any) {
    const url = SERVER_USER_API_URL + "getPos?strangID=" + strangID;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  updateName(room_id: any, newName: String) {
    const url = SERVER_USER_API_URL + "updateRoomName?id=" + room_id + "&name=" + newName;
    console.log("calling URL", url);
    return axios.get(url, { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(SERVER_USER_API_URL + "admin", { headers: authHeader() });
  }
}

export default new UserService();
