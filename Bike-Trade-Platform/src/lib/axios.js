import axios from "axios";

export const instance = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API ||
    "https://67dacbeb35c87309f52e1591.mockapi.io/he123456",
});
