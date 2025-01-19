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

export interface MedicalHistory {
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
  getAllPatients: () => Promise<Patient[]>;
  getMedicalHistoryPDF: (email: string) => Promise<string>;
  createMedicalHistory: (
    patientId: string,
    doctorId: string,
    startDate: string,
    endDate: string,
    diagnosis: string,
    description: string
  ) => Promise<MedicalHistory>;
  updateMedicalHistory: (
    medicalHistoryId: string,
    diagnosis: string,
    description: string,
    startDate: string,
    endDate: string,
    patientId: string,
    doctorId: string
  ) => Promise<MedicalHistory>;
  deleteMedicalHistory: (
    medicalHistoryId: string,
    doctorId: string
  ) => Promise<void>;
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

  const getAllPatients = async () => {
    try {
      const response = await axiosInstance.get(`/users/patients`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching patients");
    }
  };

  const getMedicalHistoryPDF = async (email: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        `/history/pdf`,
        { email },
        {
          withCredentials: true,
        }
      );
      return response.data.data.medicalHistoryUrl;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error fetching medical history PDF"
      );
    } finally {
      setLoading(false);
    }
  };

  const createMedicalHistory = async (
    patientId: string,
    doctorId: string,
    startDate: string,
    endDate: string,
    diagnosis: string,
    description: string
  ) => {
    try {
      const response = await axiosInstance.post(
        `/history`,
        {
          patient: patientId,
          doctor: doctorId,
          startDate,
          endDate,
          diagnosis,
          description,
        },
        {
          withCredentials: true,
        }
      );
      await fetchMedicalHistory(doctorId, "doctor");
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creating medical history");
    }
  };

  const updateMedicalHistory = async (
    medicalHistoryId: string,
    diagnosis: string,
    description: string,
    startDate: string,
    endDate: string,
    patientId: string,
    doctorId: string
  ) => {
    try {
      const response = await axiosInstance.patch(
        `/history/${medicalHistoryId}`,
        { diagnosis, description, patient: patientId, startDate, endDate },
        {
          withCredentials: true,
        }
      );
      await fetchMedicalHistory(doctorId, "doctor");
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating medical history");
    }
  };

  const deleteMedicalHistory = async (
    medicalHistoryId: string,
    doctorId: string
  ) => {
    try {
      const response = await axiosInstance.delete(
        `/history/${medicalHistoryId}`,
        {
          withCredentials: true,
        }
      );
      await fetchMedicalHistory(doctorId, "doctor");
      response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting medical history");
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
        getAllPatients,
        getMedicalHistoryPDF,
        createMedicalHistory,
        updateMedicalHistory,
        deleteMedicalHistory,
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
