"use client";

// Ensure this hook runs on the client side
import axiosInstance from "../utils/axiosInstance";
import { useState } from "react";

enum Role {
  Doctor = "doctor",
  Patient = "patient",
  ScanCentre = "scanCentre",
}

enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

interface BaseUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  address: string;
  role: Role;
  __v: number; // If this is versioning, include it
  createdAt: string; // You can use Date type, but it's string in the response
  updatedAt: string; // You can use Date type, but it's string in the response
  gender?: Gender; // Gender is not provided in your example, but you may include it if necessary
  googleId?: string;
}

interface AuthResponseDoctor extends BaseUser {
  role: Role.Doctor;
  specialization: string; // Required only if role is Doctor
}

interface AuthResponseOther extends BaseUser {
  role: Role.Patient | Role.ScanCentre;
  specialization?: never; // specialization is not allowed for Patient or ScanCentre
}

type AuthResponse = AuthResponseDoctor | AuthResponseOther;

// Example of the data structure based on your provided JSON
interface ApiResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: {
    user: AuthResponse;
  };
}

const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveTokensInCookies = (
    accessToken: string,
    refreshToken: string,
    user: any
  ) => {
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${
      60 * 60 * 24
    }`; // Access token expires in 1 day
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`; // Refresh token expires in 7 days
    document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`; // User data expires in 7 days
  };

  // Login Function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/users/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const { data } = response.data;

      //   const cookieStore = await cookies();

      //   const accessToken = cookieStore.get("accessToken");
      //   console.log(accessToken);

      // Save tokens in cookies (on the client side)
      //   saveTokensInCookies(accessToken, refreshToken, user);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Register Function
  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post<AuthResponse>("/register", {
        fullName,
        email,
        password,
      });

      //   const { accessToken, refreshToken, user } = response.data;

      // Save tokens in cookies (on the client side)
      //   saveTokensInCookies(accessToken, refreshToken, user);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    loading,
    error,
  };
};

export default useAuth;
