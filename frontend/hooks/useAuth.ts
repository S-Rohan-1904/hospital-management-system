"use client";

import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

interface LogoutResponse {
  statusCode: Number;
  message: string;
  success: Boolean;
  data: Object;
}

interface BaseUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  address: string;
  role: Role;
  __v: number;
  createdAt: string;
  updatedAt: string;
  gender?: Gender;
  googleId?: string;
}

interface AuthResponseDoctor extends BaseUser {
  role: Role.Doctor;
  specialization: string; // Required only if role is Doctor
}

interface AuthResponseOther extends BaseUser {
  role: Role.Patient | Role.ScanCentre;
  specialization?: never;
}

type AuthResponse = AuthResponseDoctor | AuthResponseOther;

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null); // Store current user data
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated by calling the API
    axiosInstance
      .get("/users", { withCredentials: true })
      .then((response) => {
        setIsAuthenticated(response.data.data.authenticated);
        setAuthLoading(false);
        console.log(response.data.data.authenticated);

        if (response.data.data.authenticated) {
          // Fetch current user data if authenticated
          axiosInstance
            .get("/users/current-user", { withCredentials: true })
            .then((response) => {
              setCurrentUser(response.data.data.user);
              console.log("Current User:", response.data.data.user);
            })
            .catch((err) => {
              setError("Failed to fetch current user");
              console.error(err);
            });
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setAuthLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect to login if the user is not authenticated
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Login Function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post<ApiResponse>("/users/login", {
        email,
        password,
      });

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Register Function
  const register = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout Function
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<LogoutResponse>(
        "/users/logout",
        { withCredentials: true }
      );

      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
    authLoading,
    currentUser,
  };
};

export default useAuth;
