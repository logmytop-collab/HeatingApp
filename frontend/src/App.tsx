import React, { useEffect, useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router";
import AppBar from "@mui/material/AppBar";

import "./App.css";
import AuthService from "./services/auth.service";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import LoginForm from "./components/login.component";
import RoomForm from "./components/room.component";
import RegisterForm from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import Thermostat from "./components/thermostat.component";
import BoardRoomList from "./components/board-room-list.component";
import BoardUser from "./components/board-user.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";
import EventBus from "./common/EventBus";
import { userType } from "./services/user.service";
import makeStyles from "@mui/styles/makeStyles";
import Typography from "@mui/material/Typography";
import HeatPumpIcon from "@mui/icons-material/HeatPump";
import { Console } from "console";
import BoardThermostat from "./components/board-thermostat.component";

const useStyles = makeStyles({
  root: {
    borderBottomRightRadius: "10%",
    borderBottomLeftRadius: "10%",
  },
  title: {
    fontSize: 14,
  },
  navLink: {
    fontSize: 14,
    //background: "rgba(29, 88, 156, 0)",
    color: "rgb(253, 251, 251)",
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
  },
});

function App() {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState<userType>();
  const classes = useStyles();

  const logOut = () => {
    AuthService.logout();
  };

  useEffect(() => {
    if (currentUser && currentUser.roles) {
      setShowModeratorBoard(currentUser.roles.includes("ROLE_MODERATOR"));
      setShowAdminBoard(currentUser.roles.includes("ROLE_ADMIN"));
    }
  }, [currentUser]);

  useEffect(() => {
    // Define the resize event handler
    const user = AuthService.getCurrentUser();
    console.log("Current user in app useeffect  ", JSON.stringify(user));
    if (user) {
      setCurrentUser(user);
    }

    EventBus.on("logout", () => {
      logOut();
    });
    // Cleanup the event listener when the component unmounts
    return () => {
      //logOut();
      EventBus.remove("logout", null);
      //console.log("Cleanup: Removed resize event listener");
    };
  }, []);

  return (
    <div className="App">
      <AppBar
        position="sticky"
        className={classes.root}
        enableColorOnDark
        title="My Heating"
      >
        <Container maxWidth="xl">
          <Toolbar>
            <HeatPumpIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            {showModeratorBoard && (
              <NavLink to={"/mod"} className={classes.navLink}>
                Moderator Board
              </NavLink>
            )}
            <Typography variant="h6" color="inherit" component="div">
              My Heating
            </Typography>
            {showAdminBoard && (
              <NavLink to={"/admin"} className="nav-link">
                Admin Board
              </NavLink>
            )}

            {currentUser && (
              <NavLink to={"/user"} className={classes.navLink}>
                User
              </NavLink>
            )}
            {currentUser && (
              <NavLink to={"/thermo"} className={classes.navLink}>
                Thermostat(s)
              </NavLink>
            )}
            {currentUser && (
              <NavLink to={"/rooms"} className={classes.navLink}>
                Room(s)
              </NavLink>
            )}

            {currentUser ? (
              <div>
                <NavLink to={"/profile"} className="nav-link">
                  {currentUser.username}
                </NavLink>
                <a href="/login" className="nav-link" onClick={logOut}>
                  LogOut
                </a>
              </div>
            ) : (
              <div>
                <NavLink to={"/login"} className="nav-link">
                  Login
                </NavLink>
                <NavLink to={"/register"} className="nav-link">
                  Sign Up
                </NavLink>
              </div>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/room/:id" element={<RoomForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/thermo" element={<BoardThermostat />} />
          <Route path="/rooms" element={<BoardRoomList />} />
          <Route path="/user" element={<BoardUser />} />
          <Route path="/mod" element={<BoardModerator />} />
          <Route path="/admin" element={<BoardAdmin />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
