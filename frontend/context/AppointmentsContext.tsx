"use client";

import { useAuthContext } from "@/context/AuthContext";
import axiosInstance from "@/utils/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type Payment = { orderId: string } | null;

export interface Appointment {
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
  description?: string;
  hasScanRequest: boolean;
  scanRequest: {
    _id: string;
    patient: string;
    doctor: string;
    hospital: string;
    scanCentre: string;
    scanDocument: string;
    appointment: string;
    dateOfUpload: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    status: string;
  };
  payment: Payment;
  onlineAppointment: boolean;
  meetingId: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  updateAppointment: ({
    id,
    startTime,
    endTime,
    doctor,
    hospital,
  }) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  setAppointments: (appointments: Appointment[]) => void;
  requestAppointment: ({
    doctorId,
    startTime,
    endTime,
    hospitalId,
    onlineAppointment,
  }) => Promise<void>;
  acceptAppointment: (id: string) => Promise<void>;
  rejectAppointment: (id: string) => Promise<void>;
  updateDoctorAppointment: ({
    id,
    startTime,
    endTime,
    description,
  }) => Promise<void>;
  getDoctorAndPatientAppointments: (doctorId: string) => Promise<Appointment[]>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined
);

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const response = await axiosInstance.get("/appointments", {
          withCredentials: true,
        });
        setAppointments(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async ({
    id,
    startTime,
    endTime,
    doctor,
    hospital,
  }) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(
        `/appointments/${id}`,
        { startTime, endTime, doctor, hospital },
        {
          withCredentials: true,
        }
      );
      await fetchAppointments();
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
      console.log("deleted successfully");

      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting appointment");
    } finally {
      setLoading(false);
    }
  };

  const requestAppointment = async ({
    doctorId,
    startTime,
    endTime,
    hospitalId,
    onlineAppointment,
  }) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(
        `/appointments`,
        { doctorId, startTime, endTime, hospitalId, onlineAppointment },
        {
          withCredentials: true,
        }
      );
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error requesting appointment");
    } finally {
      setLoading(false);
    }
  };

  const acceptAppointment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/appointments/${id}/scheduled`, {
        withCredentials: true,
      });
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error accepting appointment");
    } finally {
      setLoading(false);
    }
  };

  const rejectAppointment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/appointments/${id}/rejected`, {
        withCredentials: true,
      });
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error rejecting appointment");
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorAppointment = async ({
    id,
    startTime,
    endTime,
    description,
  }) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(
        `/appointments/${id}`,
        { startTime, endTime, description },
        {
          withCredentials: true,
        }
      );
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating appointment");
    } finally {
      setLoading(false);
    }
  };

  const getDoctorAndPatientAppointments = async (doctorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/appointments/${doctorId}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

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
        requestAppointment,
        acceptAppointment,
        rejectAppointment,
        updateDoctorAppointment,
        getDoctorAndPatientAppointments,
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
