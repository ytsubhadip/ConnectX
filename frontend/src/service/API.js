import axios from "axios";

const API = axios.create({
   baseURL: "https://connectx-bhpr.onrender.com",
   // baseURL: "http://localhost:8000",
});

export default API;