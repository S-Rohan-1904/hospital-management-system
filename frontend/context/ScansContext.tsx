"use client";

import { useAppointmentsContext } from "./AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import axiosInstance from "@/utils/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface Scan {
  _id: string;
  description: string;
  patient: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    password: string;
    address: string;
    role: string;
    gender: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    refreshToken: string;
  };
  doctor: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    role: string;
    specialization: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
    password: string;
    refreshToken: string;
  };
  scanCentre: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    password: string;
    address: string;
    role: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
    refreshToken: string;
  };
  hospital: {
    _id: string;
    name: string;
    address: string;
    contact: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    doctors: string[];
    __v: number;
  };
  status: string;
  __v: number;
  updatedAt: string;
  createdAt: string;
  dateOfUpload: string;
  scanDocument: string;
  isCompleted: boolean;
}

interface ScansContextType {
  scans: Scan[];
  loading: boolean;
  error: string | null;
  scanCentres: ScanCentre[];
  fetchScan: () => Promise<void>;
  requestScan: ({ scanCentre, description, appointment }) => Promise<void>;
  updateScan: ({ id, description, scanCentre }) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  setScans: (scans: Scan[]) => void;
  acceptScan: (id: string) => Promise<void>;
  rejectScan: (id: string) => Promise<void>;
  updateDoctorScan: ({ id, startTime, endTime, description }) => Promise<void>;
  fetchScanCentres: () => Promise<void>;
}

interface ScanCentre {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const ScansContext = createContext<ScansContextType | undefined>(undefined);

export const ScansProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCentres, setScanCentres] = useState<ScanCentre[]>([]);
  const { fetchAppointments } = useAppointmentsContext();

  const fetchScan = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const response = await axiosInstance.get("/scan/", {
          withCredentials: true,
        });

        setScans(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching scans");
    } finally {
      setLoading(false);
    }
  };

  const updateScan = async ({ id, description, scanCentre }) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(
        `/scan/${id}`,
        { description, scanCentre },
        {
          withCredentials: true,
        }
      );
      await fetchScan();
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating Scan");
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/scan/${id}`, {
        withCredentials: true,
      });
      console.log("deleted successfully");
      await fetchScan();
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting Scan");
    } finally {
      setLoading(false);
    }
  };

  const requestScan = async ({ scanCentre, description, appointment }) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(
        `/scan`,
        { scanCentre, description, appointment },
        {
          withCredentials: true,
        }
      );
      await fetchScan(); // Refresh scans after deletion
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting Scan");
    } finally {
      setLoading(false);
    }
  };

  const acceptScan = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/scan/${id}/scheduled`, {
        withCredentials: true,
      });

      await fetchScan();
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error accepting Scan");
    } finally {
      setLoading(false);
    }
  };

  const rejectScan = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/scan/${id}/rejected`, {
        withCredentials: true,
      });
      await fetchScan();
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error rejecting Scan");
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorScan = async ({ id, startTime, endTime, description }) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(
        `/scan/${id}`,
        { startTime, endTime, description },
        {
          withCredentials: true,
        }
      );
      await fetchScan();
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating Scan");
    } finally {
      setLoading(false);
    }
  };

  const fetchScanCentres = async () => {
    try {
      const response = await axiosInstance.get("/scan/centres", {
        withCredentials: true,
      });
      setScanCentres(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching scan centres");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchScan();
      fetchScanCentres();
    }
  }, [isAuthenticated]);

  return (
    <ScansContext.Provider
      value={{
        scans,
        loading,
        error,
        fetchScan,
        updateScan,
        deleteScan,
        setScans,
        requestScan,
        acceptScan,
        rejectScan,
        updateDoctorScan,
        fetchScanCentres,
        scanCentres,
      }}
    >
      {children}
    </ScansContext.Provider>
  );
};

export const useScansContext = () => {
  const context = useContext(ScansContext);
  if (!context) {
    throw new Error("useScansContext must be used within an ScansProvider");
  }
  return context;
};