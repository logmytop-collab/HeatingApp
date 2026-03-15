import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  View,
  Alert,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Touchable,
  Modal,
  TouchableOpacity,
  BlurEvent,
} from "react-native";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { roomSchema } from "./validationSchemas";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HeatPumpIcon from "@mui/icons-material/HeatPump";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useLocation, useNavigate, useParams } from "react-router";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import EventBus from "../common/EventBus";
import { withRouter } from "../common/with-router";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { FireExtinguisherOutlined, Padding } from "@mui/icons-material";
import SyncDisabledIcon from "@mui/icons-material/SyncDisabled";
import SyncIcon from "@mui/icons-material/Sync";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SettingsIcon from "@mui/icons-material/Settings";
import RestoreIcon from "@mui/icons-material/Restore";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import PausePresentationIcon from "@mui/icons-material/PausePresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

const RoomForm = () => {
  const [originalName, setOriginalName] = useState<string | null>();
  const [content, setContent] = useState();
  const [error, setError] = useState();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const ref = useRef(null);
  const nameTxtRef = useRef(null);
  const strangPosTxtRef = useRef(null);
  const [showStrangs, setShowStrangs] = useState(false);
  const [showStrangSettings, setShowStrangSettings] = useState(-1);
  const [moveStrangUp, setMoveStrangUp] = useState<null | boolean>(null);
  const [stepSize, setStepSize] = useState(5000);
  const [idxStrangPosEdit, setIdxStrangPosEdit] = useState(-1);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);

  console.log("RoomForm id ", JSON.stringify(id));

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    if (content) {
      setTemperature(getRoomTemperature((content as any).thermostats as any));
      setHumidity(getRoomHumidity((content as any).thermostats as any));
    }
  }, [content]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    if (idxStrangPosEdit >= 0 && strangPosTxtRef && strangPosTxtRef.current) {
      (strangPosTxtRef.current as any).focus();
    }
  }, [idxStrangPosEdit]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [showStrangSettings]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [stepSize]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    if (moveStrangUp !== null) {
      const strangID = (content as any).strangs[showStrangSettings].id;
      openCloseStrang(strangID, !moveStrangUp);
    }
  }, [moveStrangUp]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [showStrangs]); // Runs only once

  useEffect(() => {
    console.log("useEffect BoardRoom ", JSON.stringify(originalName));
  }, [originalName]); // Runs only once

  const updateContent = () => {
    UserService.getRoom(id).then(
      (response) => {
        console.log("updateContent ", JSON.stringify(response.data));
        setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  useEffect(() => {
    updateContent();
    //  const interval = setInterval(updateContent, 60000);
    //  return () => clearInterval(interval);
  }, []); // Runs only once

  const showAlert = () => {
    console.log("Alet");
    Alert.alert(
      "Welcome",
      "Do you want to continue?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ],
      { cancelable: false },
    );
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(roomSchema),
  });

  /*
    if (this.checkBtn.context._errors.length === 0) {
  }
*/
  const increaseStep = (up: boolean) => {
    const currentTargetTemp: number = content
      ? (content as any).targetTemperature
      : 22;
    const targetTemp: number = up
      ? +currentTargetTemp + 0.5
      : +currentTargetTemp - 0.5;
    console.log("new temp ", JSON.stringify(targetTemp));
    UserService.saveTargetTemp(id, targetTemp).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const enableStrang = (strangID: number, enabled: number) => {
    console.log("enableStrang ");
    UserService.enableStrang(id, strangID, enabled).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const setStrangPos = (strangID: number, pos: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.setStrangPos(id, strangID, pos).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const openCloseStrang = (strangID: number, open: boolean) => {
    console.log(
      "openCloseStrang ",
      strangID,
      " open ",
      open,
      " stepSize ",
      stepSize,
    );
    setIdxStrangPosEdit(-1);
    UserService.openCloseStrang(id, strangID, open, stepSize).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        setTimeout(() => {
          console.log("reset button after ", stepSize);
          setMoveStrangUp(null);
          getCurrentConfigStrangPos(strangID);
        }, stepSize);
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const closeStrang = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.closeStrang(id, strangID).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        setTimeout(() => {
          console.log("reset button after ", stepSize);
          setMoveStrangUp(null);
          getCurrentConfigStrangPos(strangID);
        }, stepSize);
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const openStrang = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.openStrang(id, strangID).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        setTimeout(() => {
          console.log("reset button after ", stepSize);
          setMoveStrangUp(null);
          getCurrentConfigStrangPos(strangID);
        }, stepSize);
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const setStrangZero = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.setZeroStrang(strangID).then(
      (response) => {
        console.log("new zero pos  ", JSON.stringify(response.data));
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const moveStrangZero = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.moveZeroStrang(strangID).then(
      (response) => {
        console.log("new zero pos  ", JSON.stringify(response.data));
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const moveStrangMax = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.moveMaxStrang(strangID).then(
      (response) => {
        console.log("new zero pos  ", JSON.stringify(response.data));
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const setStrangMax = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.setMaxStrang(strangID).then(
      (response) => {
        console.log("new max pos zero ", JSON.stringify(response.data));
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const getCurrentConfigStrangPos = (strangID: number) => {
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.getPosStrang(strangID).then(
      (response) => {
        console.log("get position ", JSON.stringify(response.data));
        const newContent = JSON.parse(JSON.stringify(content));
        (newContent as any).strangs[showStrangSettings].currentPos =
          response.data;
        console.log("old Content ", JSON.stringify(content));
        console.log("newContent ", JSON.stringify(newContent));
        setContent(newContent);
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const breakStrangMovement = () => {
    if (moveStrangUp === null) return;
    const strangID = (content as any).strangs[showStrangSettings].id;
    console.log("enableStrang ");
    setIdxStrangPosEdit(-1);
    UserService.breakStrangAtPos(id, strangID, moveStrangUp).then(
      (response) => {
        console.log("new temp ", JSON.stringify(response.data));
        //setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const updateName = () => {
    if (!content) return;
    console.log("update name ", (nameTxtRef.current as any).value);
    UserService.updateName(id, (nameTxtRef.current as any).value).then(
      (response) => {
        console.log("new name ", JSON.stringify(response.data));
        setContent(response.data);
      },
      (error) => {
        setError(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString(),
        );

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout", null);
        }
      },
    );
  };

  const onSubmit = (data: any) => {
    console.log("log onSubmit ...");
    setSaving(true);
    AuthService.login(data.username, data.password).then(
      () => {
        setSaving(false);

        navigate("/rooms", { replace: true });
        window.location.reload();
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setError(resMessage);
        setSaving(false);
      },
    );

    console.log("Login Data:", JSON.stringify(data));
  };

  const measureRelative = () => {
    if (ref && ref.current)
      (ref.current as any).measure(
        (
          x: number,
          y: number,
          w: number,
          h: number,
          px: number,
          py: number,
        ) => {
          console.log("Position ", x, "", y);
        },
      );
  };

  const getTemperatureColor = (temp: number) => {
    let red = 230 - 2 * (20 - +temp);
    let green = 230 - 2 * (20 - +temp);
    let blue = 140 + 2 * -temp;
    return "rgb(" + red + ", " + green + ", " + blue + ")";
  };

  const getTemperatureView = (room: any) => {
    const colors = [];
    for (let i = 0; i < 40; i++) {
      const color = getTemperatureColor(40 - i);
      colors.push(color);
    }
    const colorItems = [];

    for (let i = 0; i < 20; i++) {
      //console.log("color ", colors[i + currentTemp - 10]);
      colorItems.push(
        <View
          key={i}
          style={[
            {
              backgroundColor: colors[i + (temperature ? temperature - 10 : 0)],
              height: 4,
            },
          ]}
        ></View>,
      );
    }

    const getFlex = (upper: boolean) => {
      if (upper) return 36 - (temperature ? temperature - 10 : 0);
      return temperature ? temperature - 10 : 0;
    };

    return (
      <View
        style={[
          {
            width: 20,
            height: 90,
            borderRadius: 8,
            borderWidth: 1,
            flexDirection: "column",
          },
        ]}
      >
        <View
          style={[
            {
              flex: getFlex(true),
              backgroundColor: "rgb(241, 226, 90)",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            },
          ]}
        ></View>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: "rgb(253, 10, 10)",
              marginHorizontal: -4,
            },
          ]}
        ></View>
        <View
          style={[
            {
              flex: getFlex(false),
              backgroundColor: "rgb(194, 31, 31)",

              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            },
          ]}
        ></View>
      </View>
    );
  };

  const getGauge = () => {
    return (
      <View
        style={[
          {
            width: 90,
            borderRadius: 45,
            height: 90,
            backgroundColor: getCircleColor(),
          },
        ]}
      >
        <View
          style={[
            {
              top: 5,
              left: 5,
              width: 80,
              borderRadius: 40,
              height: 80,
              backgroundColor: "rgba(141, 107, 35, 0)",
              borderRightColor: "rgb(255,0,0)",
              borderRightWidth: 3,
              borderLeftWidth: 3,
              borderLeftColor: "rgb(0, 0, 255)",
              borderTopWidth: 4,
              borderTopColor: "rgb(155, 0, 155)",
              borderBottomWidth: 0,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Text style={[{ fontSize: 22, paddingBottom: 8 }]}>
            {content ? (content as any).targetTemperature : ""}C°
          </Text>
        </View>
        <TouchableOpacity
          style={[
            {
              position: "absolute",
              left: 4,
              width: 20,
              height: 20,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              bottom: 4,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#0247af",
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          onPress={() => {
            if (showStrangSettings < 0) increaseStep(false);
          }}
        >
          <ExpandMoreIcon
            fontSize="medium"
            color="action"
            sx={{ color: "#0247af" }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            {
              position: "absolute",
              right: 4,
              width: 20,
              height: 20,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              bottom: 4,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#af0219",
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          onPress={() => {
            increaseStep(true);
          }}
        >
          <ExpandLessIcon
            fontSize="medium"
            color="action"
            sx={{ color: "#af0219" }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const getCircleColor = () => {
    let color = content
      ? 230 - 2 * (20 - (content as any).targetTemperature)
      : 230;
    const ret = getTemperatureColor((content as any).targetTemperature);
    //console.log("Circle color ", ret);
    return ret;
    let red = content
      ? 230 - 2 * (20 - (content as any).targetTemperature)
      : "230";
    return "rgb(" + red + ", 223, 100)";
  };

  const populateStrangs = () => {
    if (!content) return;
    return renderRoomStrang((content as any).strangs);
  };

  const populateThermostates = () => {
    if (!content) return;
    return renderRoomTemperature((content as any).thermostats);
  };

  const renderRoomTemperatureHeader = () => {
    return (
      <View
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor: "rgb(80, 111, 250)",
            padding: 2,
          },
        ]}
      >
        <Text style={[{ flex: 1 }]}>Name</Text>

        <Text style={[{ flex: 1, textAlign: "center" }]}>Temp[C°]</Text>
        <Text style={[{ flex: 1, textAlign: "center" }]}>Hum</Text>
      </View>
    );
  };

  const renderRoomTemperatureCore = (item: any, index: number) => {
    return (
      <View
        key={index}
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor:
              index % 2 === 0 ? "rgb(129, 185, 248)" : "rgb(139, 139, 139)",
            padding: 2,
          },
        ]}
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
            {item.humidity} %
          </Text>
        )}
        {!item.humidity && (
          <Text style={[{ flex: 1, textAlign: "center" }]}>na</Text>
        )}
      </View>
    );
  };

  const strangButton = (item: any) => {
    return (
      <View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.smallStrangButton, { borderColor: "#af0219" }]}
          onPress={() => {
            enableStrang(item.id, item.enabled === 1 ? 0 : 1);
          }}
        >
          {item.enabled === 1 && (
            <SyncDisabledIcon
              fontSize="large"
              color="action"
              sx={{ color: "#af0219" }}
            />
          )}
          {item.enabled === 0 && (
            <SyncIcon
              fontSize="small"
              color="action"
              sx={{ color: "#af0219" }}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const strangCurrentPos = (item: any, index: number) => {
    const fire =
      item.currentPos < 10 ? (
        <LocalFireDepartmentIcon
          fontSize="small"
          color="action"
          sx={{ color: "#0026fc" }}
        />
      ) : (
        <LocalFireDepartmentIcon
          fontSize="large"
          color="action"
          sx={{ color: "#f70606" }}
        />
      );
    const notEditPos = (
      <>
        {fire}
        <TouchableOpacity
          style={[
            {
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              backgroundColor: "rgb(185, 185, 185)",
            },
          ]}
          disabled={showStrangSettings >= 0}
          onPress={() => {
            if (showStrangSettings < 0) setShowStrangSettings(index);
          }}
        >
          <SettingsIcon
            fontSize="small"
            color="action"
            sx={{ color: showStrangSettings < 0 ? "#1100ff" : "#838383" }}
          />
        </TouchableOpacity>
      </>
    );

    const editPos = (
      <View style={[{ width: 60 }]}>
        <TextInput
          ref={strangPosTxtRef}
          style={[{ flex: 1, height: 24 }]}
          onChangeText={(text) => {}}
          value={item.currentPos}
          focusable={true}
          onFocus={() => {}} // Fires when element gets focus
          onBlur={(e: BlurEvent) => {
            //e.target.nodeValue;
            //setIdxStrangPosEdit(-1);
            console.log("blur1");
          }}
          //onBlur={() => { showAlert(); setShowButton(false); }} // Fires when element loses focus
        />

        <View
          style={[
            {
              position: "absolute",
              right: 0,
              top: 20,
              flexDirection: "row",
              padding: 4,
              zIndex: 100,
              borderRadius: 6,
              borderWidth: 1,
              backgroundColor: "rgb(206, 202, 202)",
            },
          ]}
        >
          <TouchableOpacity
            style={[]}
            onPress={() => {
              setStrangPos(item.id, 100);
            }}
          >
            <LocalFireDepartmentIcon
              fontSize="medium"
              color="action"
              sx={{ color: "#ff0000" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[{ alignItems: "center", justifyContent: "center" }]}
            onPress={() => {
              setStrangPos(item.id, 0);
            }}
          >
            <LocalFireDepartmentIcon
              fontSize="small"
              color="action"
              sx={{ color: "#1100ff" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[{ alignItems: "center", justifyContent: "center" }]}
            onPress={() => {
              setShowStrangSettings(index);
            }}
          >
            <SettingsIcon
              fontSize="small"
              color="action"
              sx={{ color: "#1100ff" }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );

    return idxStrangPosEdit < 0 ? notEditPos : editPos;
  };

  const renderRoomStrangCore = (item: any, index: number) => {
    //console.log("render strang ", item);

    return (
      <View
        key={index}
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor:
              index % 2 === 0 ? "rgb(129, 185, 248)" : "rgb(139, 139, 139)",
            padding: 2,
          },
        ]}
      >
        <Text style={[{ flex: 2 }]}>{item.name}</Text>
        {!item.pin1 && (
          <Text style={[{ flex: 1, textAlign: "center" }]}>na</Text>
        )}
        {item.pin1 && (
          <Text style={[{ flex: 1, textAlign: "center" }]}>{item.pin1}</Text>
        )}
        {!item.pin2 && (
          <Text style={[{ flex: 1, textAlign: "center" }]}>na</Text>
        )}
        {item.pin2 && (
          <Text style={[{ flex: 1, textAlign: "center" }]}>{item.pin2}</Text>
        )}

        {strangCurrentPos(item, index)}
        {strangButton(item)}
      </View>
    );
  };
  const renderRoomStrangHeader = () => {
    return (
      <View
        style={[
          {
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            borderRadius: 4,
            backgroundColor: "rgb(80, 111, 250)",

            padding: 2,
          },
        ]}
      >
        <Text style={[{ flex: 2 }]}>Name</Text>

        <Text style={[{ flex: 1, textAlign: "center" }]}>Pin 1</Text>
        <Text style={[{ flex: 1, textAlign: "center" }]}>Pin 2</Text>
        <Text style={[{ flex: 1, textAlign: "center" }]}>Position</Text>
      </View>
    );
  };

  const renderRoomStrang = (thermostats: any) => {
    return (
      <View
        style={[styles.containerForm, { rowGap: 0, padding: 0, width: "100%" }]}
      >
        {renderRoomStrangHeader()}
        {thermostats.map((item: any, index: any) =>
          renderRoomStrangCore(item, index),
        )}
      </View>
    );
  };
  const renderRoomTemperature = (thermostats: any) => {
    return (
      <View
        style={[styles.containerForm, { rowGap: 0, padding: 0, width: "100%" }]}
      >
        {renderRoomTemperatureHeader()}
        {thermostats.map((item: any, index: any) =>
          renderRoomTemperatureCore(item, index),
        )}
      </View>
    );
  };

  const getRoomTemperature = (thermostats: any) => {
    let ret = 0;
    if (thermostats.length === 0) return null;
    for (let i = 0; i < thermostats.length; i++) {
      ret += thermostats[i].temperature;
    }
    return ret / thermostats.length;
  };

  const getRoomHumidity = (thermostats: any) => {
    console.log("calc temp, ", thermostats.length);
    let ret = 0;
    if (thermostats.length === 0) return null;
    for (let i = 0; i < thermostats.length; i++) {
      console.log("calc temp, ", thermostats.length);
      ret += thermostats[i].humidity;
    }
    console.log("calc temp, ", ret);
    return ret / thermostats.length;
  };

  const showStrangConfig = () => {
    if (showStrangSettings < 0 || !content) return <></>;

    const strang = (content as any).strangs[showStrangSettings];

    return (
      <View
        style={[
          {
            position: "absolute",
            top: 20,
            padding: 4,
            zIndex: 100,
            borderRadius: 6,
            borderWidth: 1,
            backgroundColor: "rgb(190, 187, 187)",
            margin: 2,
            flexDirection: "column",
            flex: 1, // Fill the screen
            justifyContent: "flex-start", // Center vertically
            alignItems: "center", // Center horizontally
            rowGap: 10,
            maxWidth: 300,
            alignSelf: "center",
            width: 200,
            height: 300,
          },
        ]}
      >
        <View
          style={[
            {
              backgroundColor: "rgb(18, 22, 103)",
              width: "100%",
              alignContent: "flex-end",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            },
          ]}
        >
          <Text
            style={[
              { color: "rgb(243, 243, 34)", width: "90%", textAlign: "center" },
            ]}
          >
            {strang.name}
          </Text>
          <TouchableOpacity
            style={[
              {
                alignContent: "center",
                justifyContent: "center",
                borderWidth: 1,
                right: 2,
                backgroundColor: "rgb(185, 185, 185)",
              },
            ]}
            onPress={() => {
              setShowStrangSettings(-1);
            }}
          >
            <CloseIcon
              fontSize="small"
              color="action"
              sx={{ color: "#1100ff" }}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            {
              width: "100%",
              alignContent: "flex-end",
              flexDirection: "row",
              alignItems: "flex-start",
              columnGap: 10,
              justifyContent: "flex-start",
            },
          ]}
        >
          <Text style={[{ textAlign: "center" }]}>
            {strang.state === 0 ? "  enabled" : "  disable"}{" "}
          </Text>
          <TouchableOpacity
            style={[
              {
                alignContent: "center",
                justifyContent: "center",
                right: 2,
                backgroundColor: "rgb(185, 185, 185)",
              },
            ]}
            onPress={() => {
              enableStrang(strang.id, strang.state === 0 ? 1 : 0);
            }}
          >
            {strang.state === 0 && (
              <TaskAltIcon
                fontSize="medium"
                color="action"
                sx={{
                  color: "#09c618",
                }}
              />
            )}
            {strang.state !== 0 && (
              <UnpublishedIcon
                fontSize="medium"
                color="action"
                sx={{
                  color: "#ae0000",
                }}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={[{ width: "100%", flexDirection: "row" }]}>
          <Text style={[{ flex: 1, textAlign: "center" }]}>Pin 1 </Text>
          <Text style={[{ flex: 1, textAlign: "center", borderWidth: 1 }]}>
            {strang.pin1}
          </Text>
          <Text style={[{ flex: 1, textAlign: "center" }]}>Pin 2 </Text>
          <Text style={[{ flex: 1, textAlign: "center", borderWidth: 1 }]}>
            {strang.pin2}
          </Text>
        </View>
        <View style={[{ width: "100%", flexDirection: "row" }]}>
          <View style={[{ width: "100%", flexDirection: "column", rowGap: 2 }]}>
            <View style={[styles.strangConfigButtonRow]}>
              <TouchableOpacity
                style={[styles.smallConfigButtonCircle]}
                onPress={() => {
                  if (moveStrangUp === null) setMoveStrangUp(true);
                }}
              >
                <NorthIcon
                  fontSize="large"
                  color="action"
                  sx={{
                    color:
                      moveStrangUp === true
                        ? "#09c618"
                        : moveStrangUp === null
                          ? "#1100ff"
                          : "#2a2a2a" /*, transform: "rotate(180deg)"*/,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallConfigButton]}
                onPress={() => {
                  if (moveStrangUp === null) {
                    const strangID = (content as any).strangs[
                      showStrangSettings
                    ].id;
                    setStrangZero(strangID);
                  }
                }}
              >
                <Text
                  style={[
                    { color: moveStrangUp === null ? "#1100ff" : "#2a2a2a" },
                  ]}
                >
                  Set 0
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallConfigButton]}
                onPress={() => {
                  if (moveStrangUp === null) {
                    const strangID = (content as any).strangs[
                      showStrangSettings
                    ].id;
                    closeStrang(strangID);
                  }
                }}
              >
                <Text
                  style={[
                    { color: moveStrangUp === null ? "#1100ff" : "#2a2a2a" },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.strangConfigButtonRow]}>
              <TouchableOpacity
                style={[styles.smallConfigButtonCircle]}
                onPress={() => {
                  if (moveStrangUp) breakStrangMovement();
                }}
              >
                <PausePresentationIcon
                  fontSize="large"
                  color="action"
                  sx={{ color: moveStrangUp === null ? "#4f4f50" : "#1100ff" }}
                />
              </TouchableOpacity>
              <View style={[{ flexDirection: "column" }]}>
                <Text style={[{ alignContent: "center" }]}>
                  Position {strang.currentPos}
                </Text>
                <View style={[{ flexDirection: "row" }]}>
                  <Text style={[{ alignContent: "center" }]}>Step size</Text>
                  <select
                    value={stepSize} // ...force the select's value to match the state variable...
                    onChange={(e) =>
                      setStepSize(Number.parseInt(e.target.value))
                    }
                  >
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                    <option value="2000">2000</option>
                    <option value="5000">5000</option>
                  </select>
                  <Text style={[{ alignContent: "center" }]}>ms</Text>
                </View>
              </View>
            </View>
            <View style={[styles.strangConfigButtonRow]}>
              <TouchableOpacity
                style={[styles.smallConfigButtonCircle]}
                onPress={() => {
                  if (moveStrangUp === null) setMoveStrangUp(false);
                }}
              >
                <SouthIcon
                  fontSize="large"
                  color="action"
                  sx={{
                    color:
                      moveStrangUp === false
                        ? "#09c618"
                        : moveStrangUp === null
                          ? "#1100ff"
                          : "#2a2a2a",
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallConfigButton]}
                onPress={() => {
                  if (moveStrangUp === null) {
                    const strangID = (content as any).strangs[
                      showStrangSettings
                    ].id;
                    setStrangMax(strangID);
                  }
                }}
              >
                <Text
                  style={[
                    { color: moveStrangUp === null ? "#1100ff" : "#2a2a2a" },
                  ]}
                >
                  Set Max
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallConfigButton]}
                onPress={() => {
                  if (moveStrangUp === null) {
                    const strangID = (content as any).strangs[
                      showStrangSettings
                    ].id;
                    openStrang(strangID);
                  }
                }}
              >
                <Text
                  style={[
                    { color: moveStrangUp === null ? "#1100ff" : "#2a2a2a" },
                  ]}
                >
                  Open
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {showStrangConfig()}
      {content && (
        <View style={styles.containerForm}>
          <HeatPumpIcon fontSize="large" color="primary" />
          <View
            style={[{ flexDirection: "row", alignItems: "center", gap: 6 }]}
          >
            <Text ref={ref} style={[{ width: 60 }]}>
              Name
            </Text>
            <Controller
              control={control}
              name="name"
              defaultValue={content ? (content as any).name : ""}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  ref={nameTxtRef}
                  style={[styles.textInput, { flex: 3 }]}
                  onChangeText={(text) => {
                    if (originalName) {
                      if (originalName === (nameTxtRef.current as any).value)
                        setOriginalName(null);
                    } else {
                      setOriginalName(content ? (content as any).name : "");
                    }
                    onChange(text);
                  }}
                  value={value}
                  onFocus={() => {}} // Fires when element gets focus
                  onBlur={(e: BlurEvent) => {
                    //e.target.nodeValue;
                    console.log(
                      "(nameTxtRef.current as any).value ",
                      (nameTxtRef.current as any).value,
                    );
                    //console.log("event ", JSON.stringify(e));

                    if ((nameTxtRef.current as any).value === originalName) {
                      setOriginalName(null);
                    }
                    console.log("blur1");
                  }}
                  //onBlur={() => { showAlert(); setShowButton(false); }} // Fires when element loses focus
                />
              )}
            />
          </View>
          {originalName && (
            <View
              style={[
                {
                  position: "absolute",
                  right: 10,
                  top: 94,
                  flexDirection: "row",
                  padding: 4,
                  zIndex: 100,
                  borderRadius: 6,
                  borderWidth: 1,
                  backgroundColor: "rgb(206, 202, 202)",
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.smallButton]}
                onPress={() => {
                  updateName();
                }}
              >
                <CheckIcon
                  fontSize="medium"
                  color="action"
                  sx={{ color: "#33ff00" }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton]}
                onPress={() => {
                  setOriginalName(null);
                }}
              >
                <HighlightOffIcon
                  fontSize="medium"
                  color="action"
                  sx={{ color: "#af0202" }}
                />
              </TouchableOpacity>
            </View>
          )}
          {errors.name && (
            <Text style={{ color: "red" }}>{errors.name.message}</Text>
          )}

          <View
            style={[
              { flexDirection: "row", alignItems: "center", columnGap: 12 },
            ]}
          >
            {getGauge()}
            {getTemperatureView(content)}
            <View
              style={[
                {
                  justifyContent: "flex-start",
                },
              ]}
            >
              <Text style={[{ fontSize: 22, padding: 8 }]}>
                {temperature ? temperature : ""}C°
              </Text>
              <Text style={[{ fontSize: 18, padding: 8 }]}>
                {humidity ? humidity : ""} %
              </Text>
            </View>
          </View>
          {errors.size && (
            <Text style={{ color: "red" }}>{errors.size.message}</Text>
          )}
          <View
            style={[{ flexDirection: "row", alignItems: "center", gap: 6 }]}
            onLayout={(event) => {
              //console.log("log layout :");

              const layout = event.nativeEvent.layout;
              //console.log("height:", layout.height);
              //console.log("width:", layout.width);
              //console.log("x:", layout.x);
              //console.log("y:", layout.y);
            }}
          >
            <Text style={[{ width: 60 }]}>Size</Text>
            <Controller
              control={control}
              name="targetTemperature"
              defaultValue={content ? (content as any).targetTemperature : ""}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textInput, { flex: 3 }]}
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />
          </View>
          {errors.size && (
            <Text style={{ color: "red" }}>{errors.size.message}</Text>
          )}

          <Button
            title="Save"
            disabled={saving}
            onPress={handleSubmit(onSubmit)}
          />
          {error && <Text style={{ color: "red" }}>{error}</Text>}
          {populateThermostates()}

          <View
            style={[
              styles.containerForm,
              {
                padding: 0,
                width: "100%",
                flexDirection: "column",
                minHeight: 20,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                {
                  position: "absolute",
                  right: 4,
                  top: -16,
                  width: 20,
                  height: 20,
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  borderWidth: 2,
                  zIndex: 10,
                  backgroundColor: "rgb(185, 185, 185)",
                },
              ]}
              disabled={showStrangSettings >= 0}
              onPress={() => {
                setShowStrangs(!showStrangs);
              }}
            >
              {!showStrangs && (
                <ExpandMoreIcon
                  fontSize="medium"
                  color="action"
                  sx={{ color: showStrangSettings < 0 ? "#1100ff" : "#838383" }}
                />
              )}
              {showStrangs && (
                <ExpandLessIcon
                  fontSize="medium"
                  color="action"
                  sx={{ color: showStrangSettings < 0 ? "#1100ff" : "#838383" }}
                />
              )}
            </TouchableOpacity>
            {showStrangs && populateStrangs()}
          </View>
        </View>
      )}
      {!content && <Text>Loading () ...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flex: 1, // Fill the screen
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    rowGap: 10,
    padding: 10,
    alignSelf: "center",
  },
  containerForm: {
    margin: 2,
    flexDirection: "column",
    flex: 1, // Fill the screen
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "#f0f0f0",
    rowGap: 10,
    maxWidth: 300,
    padding: 10,
    alignSelf: "center",
    borderRadius: 6,
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
  },
  smallButton: {
    padding: 4,
    borderRadius: 24,
    backgroundColor: "rgb(125,125,125)",
    zIndex: 100,
  },
  smallConfigButtonCircle: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    width: 46,
    height: 46,
    backgroundColor: "rgb(221, 220, 220)",
  },
  smallConfigButton: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    width: 62,
    height: 40,
    backgroundColor: "rgb(221, 220, 220)",
  },
  strangConfigButtonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    columnGap: 8,
    alignContent: "center",
  },
  smallStrangButton: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "rgb(185, 185, 185)",
  },
});

export default withRouter(RoomForm);
