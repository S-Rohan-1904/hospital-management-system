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

export interface Room {
  patientId: string; // Unique identifier for the patient
  email: string; // Email of the patient
  fullName: string; // Full name of the patient
  bedId: string; // Unique identifier for the bed
  bedNumber: number; // Bed number in the room
  ward: string; // Ward identifier
  floor: number; // Floor number where the ward is located
  admissionDate: string; // ISO date string for admission
  dischargeDate: string; // ISO date string for discharge
}

interface FoodItem {
  _id: string;
  hospitalId: string;
  foodItem: string;
  description: string;
  available: boolean;
  price: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Hospital {
  _id: string;
  name: string;
  address: string;
  contact: string;
}

interface WardDetails {
  unoccupiedBeds: number;
  bedCost: number;
}

export interface HospitalData {
  hospital: Hospital;
  wardDetails: {
    [wardName: string]: WardDetails;
  };
}

interface RoomManagementContextType {
  wards: HospitalData;
  occupiedBeds: Room[];
  foodAvailable: FoodItem[];
  loading: boolean;
  error: string | null;
  fetchWards: () => Promise<void>;
  allotRoom: (ward: string, email: string) => Promise<void>;
  changeRoom: (ward: string, email: string) => Promise<void>;
  fetchOccupiedBeds: () => Promise<void>;
  fetchFoodAvailable: () => Promise<void>;
  orderFood: (
    orders: {
      email: string;
      foodId: string;
      quantity: number;
    }[]
  ) => Promise<void>;
  dischargePatient: (email: string) => Promise<void>;
  getPendingPayments: (email: string) => Promise<void>;
  pendingPayments: any;
  setPendingPayments: (pendingPayments: any) => void;
}

const RoomManagementContext = createContext<
  RoomManagementContextType | undefined
>(undefined);

export const RoomManagementProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isAuthenticated } = useAuthContext();
  const [wards, setWards] = useState<HospitalData>();
  const [occupiedBeds, setOccupiedBeds] = useState<Room[]>([]);
  const [foodAvailable, setFoodAvailable] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState([]);

  const fetchWards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/room", {
        withCredentials: true,
      });
      setWards(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching wards");
    } finally {
      setLoading(false);
    }
  };

  const allotRoom = async (ward: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(
        `/room/allot`,
        { ward, email },
        { withCredentials: true }
      );
      await fetchOccupiedBeds();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error allotting room");
    } finally {
      setLoading(false);
    }
  };

  const changeRoom = async (ward: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(
        `/room/change`,
        { ward, email },
        { withCredentials: true }
      );
      await fetchOccupiedBeds();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error changing room");
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupiedBeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/room/occupied-rooms", {
        withCredentials: true,
      });
      setOccupiedBeds(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching occupied beds");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodAvailable = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/room/food", {
        withCredentials: true,
      });
      setFoodAvailable(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error fetching food availability"
      );
    } finally {
      setLoading(false);
    }
  };

  const orderFood = async (
    orders: {
      email: string;
      foodId: string;
      quantity: number;
    }[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post(
        `/room/food/order`,
        { orders },
        { withCredentials: true }
      );
      await fetchFoodAvailable();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error ordering food");
    } finally {
      setLoading(false);
    }
  };

  const dischargePatient = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(
        `/room/discharge`,
        { email },
        { withCredentials: true }
      );
      await fetchOccupiedBeds();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error discharging patient");
    } finally {
      setLoading(false);
    }
  };

  const getPendingPayments = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        "/room/pending-payments",
        {
          email,
        },
        {
          withCredentials: true,
        }
      );
      console.log(response.data.data);

      setPendingPayments(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error getting pending payments for patient"
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWards();
      fetchOccupiedBeds();
      fetchFoodAvailable();
    }
  }, [isAuthenticated]);

  return (
    <RoomManagementContext.Provider
      value={{
        wards,
        occupiedBeds,
        foodAvailable,
        loading,
        error,
        fetchWards,
        allotRoom,
        changeRoom,
        fetchOccupiedBeds,
        fetchFoodAvailable,
        orderFood,
        dischargePatient,
        getPendingPayments,
        setPendingPayments,
        pendingPayments,
      }}
    >
      {children}
    </RoomManagementContext.Provider>
  );
};

export const useRoomManagementContext = () => {
  const context = useContext(RoomManagementContext);
  if (!context) {
    throw new Error(
      "useRoomManagementContext must be used within a RoomManagementProvider"
    );
  }
  return context;
};
