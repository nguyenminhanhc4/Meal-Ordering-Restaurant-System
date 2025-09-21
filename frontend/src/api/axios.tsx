// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1", // thay bằng URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
