import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // Include cookies by default
});

// Add interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response, // Return response if successful
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to token expiration
    if (
      error.response?.status === 401 &&
      !originalRequest._retry // Prevent infinite loops
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshResponse = await axiosInstance.post(
          "/users/refresh-token",
          null,
          {
            withCredentials: true, // Include the refreshToken cookie
          }
        );

        // Retry the original request after refreshing the token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        throw refreshError;
      }
    }

    throw error;
  }
);

export default axiosInstance;
