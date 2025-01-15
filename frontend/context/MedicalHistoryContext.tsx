"use client";

import axiosInstance from "@/utils/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface Patient {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string; // URL to avatar image
  password: string; // Hashed password
  address: string;
  role: string; // Typically "patient"
  gender: string; // "male", "female", etc.
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  refreshToken: string;
}

interface Doctor {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string; // URL to avatar image
  role: string; // Typically "doctor"
  specialization: string;
  __v: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  password: string; // Hashed password
  refreshToken: string;
}

interface Hospital {
  location: Location;
  _id: string;
  name: string;
  address: string;
  contact: string; // Contact number
  doctors: string[]; // Array of doctor IDs
  __v: number;
}

interface Location {
  type: string; // Typically "Point"
  coordinates: [number, number]; // [longitude, latitude]
}

interface MedicalHistory {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  hospital: Hospital;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  scanDocuments: string[]; // Array of document URLs
  diagnosis: string;
  description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface MedcialHistoryContextType {
  medicalHistory: MedicalHistory[];
  loading: boolean;
  error: string | null;
  fetchMedicalHistory: (id: string, type: string) => Promise<MedicalHistory[]>;
  fetchMedicalHistoryById: (
    medicalHistoryId: string
  ) => Promise<MedicalHistory[]>;
  setMedicalHistory: (medicalHistory: MedicalHistory[]) => void;
}

const MedicalHistoryContext = createContext<
  MedcialHistoryContextType | undefined
>(undefined);

export const MedicalHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalHistory = async (id: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/history/${id}`, {
        withCredentials: true,
        params: { type },
      });

      setMedicalHistory(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching medicalHistory");
    } finally {
      setLoading(false);
    }
  };
  const fetchMedicalHistoryById = async (medicalHistoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/history/${medicalHistoryId}`, {
        withCredentials: true,
      });

      setMedicalHistory(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching medicalHistory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MedicalHistoryContext.Provider
      value={{
        medicalHistory,
        loading,
        error,
        fetchMedicalHistory,
        setMedicalHistory,
        fetchMedicalHistoryById,
      }}
    >
      {children}
    </MedicalHistoryContext.Provider>
  );
};

export const useMedicalHistoryContext = () => {
  const context = useContext(MedicalHistoryContext);
  if (!context) {
    throw new Error(
      "useMedicalHistoryContext must be used within an MedicalHistoryProvider"
    );
  }
  return context;
};
