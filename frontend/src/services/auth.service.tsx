import axios from "axios";
import { userType } from "./user.service";
import { SERVER_API_URL } from "./config";


export const SERVER_AUTH_API_URL = SERVER_API_URL + "/api/auth/";


class AuthService {
  async login(username: string, password: string) {
    //console.log("logon ", username, " pwd ", password);

    const response = await axios.post(SERVER_AUTH_API_URL + "signin", {
      username,
      password,
    });
    //console.log("log in responce: ", JSON.stringify(response.data));
    const user: userType = response.data as userType;
    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username: string, email: string, password: string) {
    return axios.post(SERVER_AUTH_API_URL + "signup", {
      username,
      email,
      password,
    });
  }

  getCurrentUser() {
    const str = localStorage.getItem("user");
    console.log("get current user ", str);
    return str ? (JSON.parse(str) as userType) : null;
  }
}

export default new AuthService();
