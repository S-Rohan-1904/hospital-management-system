"use client";

import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

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
  statusCode: number;
  message: string;
  success: boolean;
  data: object;
}

interface BaseUser {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  address: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  gender?: Gender;
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

interface AuthContextType {
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (formData: FormData) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  currentUser: AuthResponse | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAuthStatus: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null);
  const router = useRouter();

  const fetchAuthStatus = async () => {
    try {
      const response = await axiosInstance.get("/users", {
        withCredentials: true,
      });

      setIsAuthenticated(response.data.authenticated);

      if (response.data.authenticated) {
        const userResponse = await axiosInstance.get("/users/current-user", {
          withCredentials: true,
        });

        setCurrentUser(userResponse.data.data);
        return userResponse.data.data;
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Failed to check authentication:", err);
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };
  // Fetch authentication status and user data
  useEffect(() => {
    fetchAuthStatus();
  }, []);

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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

      setIsAuthenticated(true);
      setCurrentUser(response.data.data.user);
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
      await axiosInstance.get<LogoutResponse>("/users/logout", {
        withCredentials: true,
      });

      setIsAuthenticated(false);
      setCurrentUser(null);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        logout,
        loading,
        setLoading,
        setError,
        error,
        isAuthenticated,
        authLoading,
        currentUser,
        fetchAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
