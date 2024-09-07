import axios from "axios";

const mainUrl = "http://localhost:8000/api/v1";

const AxiosInstance = axios.create({
  baseURL: mainUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const ApiCollection = {
  auth: {
    signup: {
      url: "/auth/signup",
      method: "POST",
    },
    login: {
      url: "/auth/login",
      method: "POST",
    },
    logout: {
      url: "/auth/logout",
      method: "POST",
    },
    getCsrfToken: {
      url: "/auth/csrf-token",
      method: "GET",
    },
    googleAuth: {
      url: "/auth/google",
      method: "GET",
    },
    googleAuthCallback: {
      url: "/auth/google/callback",
      method: "GET",
    },
  },
};

export { ApiCollection, AxiosInstance };
