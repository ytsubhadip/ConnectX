import axios from "axios";

const API = axios.create({
   baseURL: "https://connectx-bhpr.onrender.com",
});

export default API;