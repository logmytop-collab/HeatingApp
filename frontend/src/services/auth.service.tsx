import axios from "axios";
import { userType } from "./user.service";

const API_URL = "http://localhost:3000/api/auth/";

class AuthService {
  async login(username: string, password: string) {
    //console.log("logon ", username, " pwd ", password);

    const response = await axios.post(API_URL + "signin", {
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
    return axios.post(API_URL + "signup", {
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
