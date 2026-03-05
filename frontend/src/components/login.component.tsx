import React, { useState, useEffect } from "react";
import { Image, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "./validationSchemas";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useLocation, useNavigate, useParams } from "react-router";
import AuthService from "../services/auth.service";

import { withRouter } from "../common/with-router";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      console.log("useEffect ...", loading);
      //  handleSubmit(onSubmit);
    }
  }, [loading]);

  useEffect(() => {}, [message]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  /*
    if (this.checkBtn.context._errors.length === 0) {
  }
*/
  const onSubmit = (data: any) => {
    console.log("log onSubmit ...");
    setLoading(true);
    AuthService.login(data.username, data.password).then(
      () => {
        setLoading(false);

        navigate("/profile", { replace: true });
        window.location.reload();
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        setMessage(resMessage);
      }
    );

    console.log("Login Data:", JSON.stringify(data));
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerForm}>
        <PersonOutlineIcon fontSize="large" color="primary" />
        <Text>Username</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.textInput}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.username && (
          <Text style={{ color: "red" }}>{errors.username.message}</Text>
        )}

        <Text>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.textInput}
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={{ color: "red" }}>{errors.password.message}</Text>
        )}
        {message && <Text style={{ color: "red" }}>{message}</Text>}

        <Button
          title="Login"
          disabled={loading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
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
    margin: 10,
    flex: 1, // Fill the screen
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "#f0f0f0",
    rowGap: 10,
    maxWidth: 200,
    padding: 10,
    alignSelf: "center",
    borderRadius: 6,
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
  },
});

export default withRouter(LoginForm);
