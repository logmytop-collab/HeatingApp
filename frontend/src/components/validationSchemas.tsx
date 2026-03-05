import * as yup from "yup";
import moment from "moment";

export const loginSchema = yup.object({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters")
    .required("Password is required"),
});

export const roomSchema = yup.object({
  name: yup
    .string()
    .min(5, "Username must be at least 3 characters")
    .required("Username is required"),
  size: yup.number().typeError("Must be a number"),
  targetTemperature: yup
    .number()
    .min(5, "Minimum 5")
    .max(30, "Minimum 5")
    .required("Target temperature is required"),
  temperature: yup
    .number()
    .min(5, "Minimum 5")
    .max(30, "Minimum 5")
    .required("Target temperature is required"),
});

export const registerSchema = yup.object({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  email: yup
    .string()
    .min(5, "Password must be at least 5 characters")
    .required("Password is required"),
  password: yup
    .string()
    .min(5, "Password must be at least 5 characters")
    .required("Password is required"),
});

export const forgotPasswordSchema = yup.object({
  username: yup.string().required("Username is required"),
});

export const requestTimeOffSchema = yup.object({
  leaveType: yup.object().required("Please select leave type"),
  dateRange: yup.object().required("Please select a date"),
});

export const bankLetterSchema = yup.object({
  leaveType: yup.object().required("Please select letter type"),
  bankName: yup.object().required("Please select a bank"),
  comments: yup
    .string()
    .max(50, "Comments should not exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9 .]*$/,
      "Comments should not contain special characters except .",
    )
    .nullable(),
});

const timeAndDateOfIncident = {
  dateOfIncident: yup
    .object({
      startDate: yup.date().required("Please select date of incident"),
    })
    .required("Please select date of incident"),
  timeOfIncident: yup
    .string()
    .required("Please select time of incident")
    .test(
      "time-validation",
      "Time should not exceed current time",
      function (value) {
        const { startDate } = this.parent.dateOfIncident;
        if (!startDate || !value) return true;
        const currentDate = moment();
        const selectedDate = moment(startDate);
        const selectedTime = moment(value, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        return !(
          selectedDate.isSame(currentDate, "day") &&
          selectedTime.isAfter(currentDate)
        );
      },
    ),
};

export const goodObservation = yup.object({
  incidentLocation: yup.object().required("Please select location"),
  comments: yup.string().required("What you observed is required"),
  ...timeAndDateOfIncident,
});

export const singleShiftAttendance = yup.object({
  f1: yup
    .string()
    .required("Check-in time is required")
    .test(
      "is-lower-than-f2",
      "Check-in time must be less than Check-out time",
      function (value) {
        const { f2, f1nextDay, f2nextDay } = this.parent;
        if (!value || !f2 || f1nextDay || f2nextDay) return true;
        return new Date(value) < new Date(f2);
      },
    ),
  f2: yup
    .string()
    .required("Check-out time is required")
    .test(
      "is-greater-than-f1",
      "Check-out time must be greater than Check-in time",
      function (value) {
        const { f1, f1nextDay, f2nextDay } = this.parent;
        if (!value || !f1 || f1nextDay || f2nextDay) return true;
        return new Date(value) > new Date(f1);
      },
    ),
  reason: yup.object().required("Please select reason"),
});
