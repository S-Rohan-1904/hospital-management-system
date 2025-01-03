"use client";

import axiosInstance from "@/utils/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
  };
  doctor: {
    _id: string;
    fullName: string;
    email: string;
    specialization: string;
  };
  hospital: {
    _id: string;
    name: string;
    address: string;
  };
  startTime: string;
  endTime: string;
  status: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  updateAppointment: (
    id: string,
    updatedData: Partial<Appointment>
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  setAppointments: (appointments: Appointment[]) => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined
);

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/appointments/", {
        withCredentials: true,
      });
      setAppointments(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (
    id: string,
    updatedData: Partial<Appointment>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.put(`/appointments/${id}`, updatedData, {
        withCredentials: true,
      });
      await fetchAppointments(); // Refresh appointments after update
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating appointment");
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/appointments/${id}`, {
        withCredentials: true,
      });
      await fetchAppointments(); // Refresh appointments after deletion
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting appointment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        error,
        fetchAppointments,
        updateAppointment,
        deleteAppointment,
        setAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointmentsContext = () => {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error(
      "useAppointmentsContext must be used within an AppointmentsProvider"
    );
  }
  return context;
};
