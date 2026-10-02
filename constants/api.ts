import { Platform } from "react-native";

//if there's a error "Unable to reach the server"
const PC_IP_ADDRESS = ""; // Replace with your PC's local IP address.

const host = PC_IP_ADDRESS || (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const API_BASE_URL = `http://${host}:3000`;

export const API_PATHS = {
  login: "/login",
  register: "/register",
  students: "/students",
  studentById: (id: string) => `/students/${encodeURIComponent(id)}`,
  profile: (userId: string) => `/users/${encodeURIComponent(userId)}`,
};

