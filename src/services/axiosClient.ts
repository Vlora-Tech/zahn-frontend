import axios, { AxiosInstance } from "axios";

// Environment variables
const apiBaseUrl =
  import.meta.env.VITE_APP_API_BASE_URL ||
  "https://zahn-backend.vercel.app/api";

// Create an Axios instance with default configurations
const client: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5 * 60000, // 5 minutes timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Send cookies with requests
});

client.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle other errors
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized - redirecting to login.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    if (error.response) {
      if (error.response.status === 403) {
        console.error("Forbidden - you do not have permission.");
      }
    } else if (error.request) {
      console.error("No response received from server.");
    } else {
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

export default client;
