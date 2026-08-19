import axios from "axios";

const api = axios.create({
  baseURL: "https://blog-app-server-virid.vercel.app/api",
  withCredentials: true,
});

export default api;
