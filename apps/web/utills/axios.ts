import axios from "axios";

const api = axios.create({
  baseURL: "https://blog-app-server-drab-chi.vercel.app/api",
  withCredentials: true,
});

export default api;
