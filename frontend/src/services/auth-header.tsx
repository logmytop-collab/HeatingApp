export default function authHeader() {
  const str = localStorage.getItem("user");
  const user = str ? JSON.parse(str) : "dummy";

  if (user && user.accessToken) {
    // return { Authorization: 'Bearer ' + user.accessToken }; // for Spring Boot back-end
    return { "x-access-token": user.accessToken }; // for Node.js Express back-end
  } else {
    return {};
  }
}
