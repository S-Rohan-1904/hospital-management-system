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
  email: string;
  fullName: string;
  avatar: string;
  address: string;
  role: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  role: string;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

interface Hospital {
  location: Location;
  _id: string;
  name: string;
  address: string;
  contact: string;
  doctors: string[];
}

interface Location {
  type: string;
  coordinates: [number, number];
}

interface MedicalHistory {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  hospital: Hospital;
  startDate: string;
  endDate: string;
  scanDocuments: string[];
  diagnosis: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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
