"use client";

import axiosInstance from "@/utils/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contact: string;
  location: {
    type: string;
    coordinates: number[];
  };
  doctors: {
    _id: string;
    fullName: string;
    specialization: string;
  }[];
}

interface HospitalsContextType {
  hospitals: Hospital[];
  loading: boolean;
  error: string | null;
  fetchHospitals: () => Promise<void>;
  setHospitals: (hospitals: Hospital[]) => void;
}

const HospitalsContext = createContext<HospitalsContextType | undefined>(
  undefined
);

export const HospitalsProvider = ({ children }: { children: ReactNode }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/hospital/", {
        withCredentials: true,
      });

      setHospitals(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  return (
    <HospitalsContext.Provider
      value={{
        hospitals,
        loading,
        error,
        fetchHospitals,
        setHospitals,
      }}
    >
      {children}
    </HospitalsContext.Provider>
  );
};

export const useHospitalsContext = () => {
  const context = useContext(HospitalsContext);
  if (!context) {
    throw new Error(
      "useHospitalsContext must be used within an HospitalsProvider"
    );
  }
  return context;
};
