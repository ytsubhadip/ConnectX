import axios from "axios";

const API = axios.create({
   baseURL: "https://connectx-bhpr.onrender.com",
//    baseURL: "http://localhost:8000",
});

// REQUEST INTERCEPTOR
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

// RESPONSE INTERCEPTOR

API.interceptors.response.use(

    // Successful response
    (response) => {
        return response;
    },

    // Error response
    (error) => {

        if (error.response?.status === 401) {

            console.log("Token expired or invalid. Logging out...");

            // Remove authentication data
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            // Redirect to login
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);


export default API;