import React, { Component, useEffect, useState } from "react";
import { withRouter } from "./../common/with-router";
import { useLocation, useNavigate, useParams } from "react-router";

import {
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import UserService from "../services/user.service";
import EventBus from "../common/EventBus";

const BoardRoomList = () => {
  const [content, setContent] = useState();
  const [error, setError] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [content]); // Runs only once

  useEffect(() => {
    UserService.getRoomBoard().then(
      (response) => {
        console.log("Board Room ", JSON.stringify(response.data));
        setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString()
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      }
    );
  }, []); // Runs only once

  const renderRoomRow = (item: any) => {
    console.log("renderRoomRow ", item.index);

    const renderRoomTemperatureCore = (item: any) => {
      return (
        <View
          style={[{ alignItems: "center", flexDirection: "row", width: 200 }]}
        >
          <Text style={[{ flex: 1 }]}>{item.name}</Text>
          {item.temperature && (
            <Text style={[{ flex: 1, textAlign: "center" }]}>
              {item.temperature}
            </Text>
          )}
          {!item.temperature && (
            <Text style={[{ flex: 1, textAlign: "center" }]}>na</Text>
          )}
          {item.humidity && (
            <Text style={[{ flex: 1, textAlign: "center" }]}>
              {item.humidity}
            </Text>
          )}
          {!item.humidity && (
            <Text style={[{ flex: 1, textAlign: "center" }]}>na</Text>
          )}
        </View>
      );
    };
    const renderRoomTemperature = (thermostats: any) => {
      return (
        <View style={[{ alignItems: "center", flexDirection: "column" }]}>
          {thermostats.map((item: any, index: any) =>
            renderRoomTemperatureCore(item)
          )}
        </View>
      );
    };

    const renderRoomStrangCore = (item: any) => {
      return (
        <View style={[{ alignItems: "center", flexDirection: "row" }]}>
          <Text style={[{ flex: 1 }]}>{item.name}</Text>
        </View>
      );
    };

    const handlePress = (roomID: any) => {
      //Alert.alert("Button Pressed!", "You clicked the button.");
      navigate("/room/" + roomID, { replace: true });
      console.log("Button was pressed");
    };

    const renderRoomStrang = (strangs: any) => {
      return (
        <View
          style={[
            { alignItems: "center", flexDirection: "column", width: 100 },
          ]}
        >
          {strangs.map((item: any, index: any) => renderRoomStrangCore(item))}
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor:
              item.index % 2 === 0
                ? "rgba(162, 206, 235, 0.88)"
                : "transparent",
          },
        ]}
        onPress={() => {
          handlePress(item.item.id);
        }}
      >
        <Text style={styles.firstText}>{item.item.name}</Text>
        {renderRoomTemperature(item.item.thermostats)}
        {renderRoomStrang(item.item.strangs)}
      </TouchableOpacity>
    );
  };

  return (
    <div className="container">
      <header className="jumbotron">
        {content && (
          <FlatList
            data={content}
            renderItem={(item) => renderRoomRow(item)}
            keyExtractor={(item, index) => index.toString()} // unique key for each item
          />
        )}
        {error && <Text>{error}</Text>}
      </header>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 8,
    margin: "auto" /* centers horizontally */,
  },
  firstText: {
    width: 100,
    fontSize: 16,
    fontWeight: "bold",
    alignItems: "center",
    alignSelf: "center",
  },
  secondText: {
    width: 100,
    fontSize: 14,
  },
});

export default withRouter(BoardRoomList);
