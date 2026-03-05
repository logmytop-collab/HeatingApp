import React, { Component, useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import UserService from "../services/user.service";
import EventBus from "../common/EventBus";
import { useLocation, useNavigate, useParams } from "react-router";

const BoardThermostat = () => {
  const [content, setContent] = useState();
  const [error, setError] = useState();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("useEffect BoardThermostat", content);
  }, [content]); // Runs only once

  useEffect(() => {
    UserService.getThermostatBoard().then(
      (response) => {
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

    const handlePress = (roomID: any) => {
      //Alert.alert("Button Pressed!", "You clicked the button.");
      navigate("/room/" + roomID, { replace: true });
      console.log("Button was pressed");
    };


  const renderThermostat = (item: any) => {
    console.log("useEffect BoardThermostat", item);

    const renderTemperature = (item: any) => {
      return (
        <View
          style={[{ alignItems: "center", flexDirection: "column", width: 70 }]}
        >
          {item.temperature && <Text style={[{fontSize: 18}]}>{item.temperature} °C</Text>}
          {!item.temperature && <Text style={[]}>na</Text>}
          {item.humidity && <Text style={[{fontSize: 14}]}>{item.humidity} %</Text>}
          {!item.humidity && <Text style={[]}>na</Text>}
        </View>
      );
    };
    const renderStrang = (strangs: any) => {
      return (
        <View>
          {strangs.map((item: any, index: any) => (
            <Text key={index} style={[]}>
              {item.name}
            </Text>
          ))}
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
        }}>
        <Text style={styles.firstText}>{item.item.name}</Text>
        {renderTemperature(item.item)}
        <Text style={styles.secondText}>{item.item.room.name}</Text>
        {item.item.room.strangs && renderStrang(item.item.room.strangs)}
      </TouchableOpacity>
    );
  };

  return (
    <div className="container">
      <header className="jumbotron">
        {content && (
          <FlatList
            data={content}
            renderItem={(item) => renderThermostat(item)}
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

export default BoardThermostat;
