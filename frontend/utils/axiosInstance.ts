import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    "https://hospital-management-system-backend-lewn.onrender.com/api/v1",
  withCredentials: true, // Include cookies by default
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/users/refresh-token"
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshResponse = await axiosInstance.post(
            "/users/refresh-token",
            null,
            { withCredentials: true }
          );

          const newToken = refreshResponse.data.token;

          onRefreshed(newToken);
          isRefreshing = false;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          console.error("Token refresh failed:", refreshError);
        }
      } else {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
