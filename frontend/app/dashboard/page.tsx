"use client";

import Loading from "./loading";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LatestItemCard from "@/components/latest-item"; // Assuming you've created the LatestItemCard
import { useRoomManagementContext } from "@/context/RoomManagementContext";
import { useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

export default function Dashboard() {
  const { appointments, loading, error } = useAppointmentsContext();
  const { isAuthenticated, authLoading, currentUser } = useAuthContext();
  const { getPendingPayments, pendingPayments } = useRoomManagementContext();
  const router = useRouter();

  // If auth check is still loading, show a loading state
  if (authLoading) {
    return <Loading />;
  }

  // Logic to determine the latest appointment
  let latestItem = null;

  if (currentUser?.role === "doctor" || currentUser?.role === "patient") {
    latestItem = appointments?.[appointments.length - 1]; // Get the latest appointment
  }

  // Render loading, error, or appointments based on the state
  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Render the LatestItemCard based on the role */}
      <LatestItemCard latestItem={latestItem} />
    </div>
  );
}
