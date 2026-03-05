import React, { Component, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { userType } from "../services/user.service";

type profileType = {
  redirect: string | null;
  userReady: boolean;
  currentUser: userType | null;
};

const Profile = () => {
  const [state, setState] = useState<profileType>();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser)
      setState({
        redirect: "/home",
        currentUser: currentUser,
        userReady: false,
      });
    setState({
      redirect: null,
      currentUser: currentUser,
      userReady: true,
    });
  }, []); // Runs only once

  if (state !== undefined && state.redirect) {
    return <Navigate to={state.redirect} />;
  }

  const currentUser = state?.currentUser;

  return (
    <div className="container">
      {state && state.userReady ? (
        <div>
          <header className="jumbotron">
            <h3>
              <strong>{currentUser ? currentUser.username : "ups"}</strong>{" "}
              Profile
            </h3>
          </header>
          <p>
            <strong>Token:</strong>{" "}
            {currentUser && currentUser.accessToken
              ? currentUser.accessToken.substring(0, 20)
              : "no token"}{" "}
            ...{" "}
            {currentUser && currentUser.accessToken
              ? currentUser.accessToken.substr(
                  currentUser.accessToken.length - 20
                )
              : "no token"}
          </p>
          <p>
            <strong>Id:</strong> {currentUser ? currentUser.id : 0}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {currentUser ? currentUser.email : "no email"}
          </p>
          <strong>Authorities:</strong>
          <ul>
            {currentUser &&
              currentUser.roles &&
              currentUser.roles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
