import axios from "axios";

// With Vite proxy configured, use relative /api path in development so cookies are same-site.
export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
