import axios from "axios";

const API = axios.create({
   baseURL: "https://connectx-bhpr.onrender.com",
   // baseURL: "http://localhost:8000",
});

API.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default API;