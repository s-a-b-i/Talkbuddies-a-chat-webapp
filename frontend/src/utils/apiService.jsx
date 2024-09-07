import { AxiosInstance, ApiCollection } from "./api_routes";

export const authApi = {
  getCsrfToken: async () => {
    const response = await AxiosInstance.get(
      ApiCollection.auth.getCsrfToken.url
    );
    AxiosInstance.defaults.headers["X-CSRF-Token"] = response.data.csrfToken;
    return response.data.csrfToken;
  },

  signup: (data) => AxiosInstance.post(ApiCollection.auth.signup.url, data),

  login: (data) => AxiosInstance.post(ApiCollection.auth.login.url, data),

  logout: () => AxiosInstance.post(ApiCollection.auth.logout.url),

  initiateGoogleAuth: () => {
    window.location.href = `${AxiosInstance.defaults.baseURL}${ApiCollection.auth.googleAuth.url}`;
  },

  // This function might not be needed as the callback is handled by the backend
  
};