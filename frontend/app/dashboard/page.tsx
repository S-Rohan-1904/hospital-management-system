"use client";

import Loading from "./loading";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

export default function ScanDashboard() {
  const { appointments, loading, error } = useAppointmentsContext();
  const { isAuthenticated, authLoading, currentUser } = useAuthContext(); // Access currentUser

  // If auth check is still loading, show a loading state
  if (authLoading) {
    return <Loading />;
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
      <p>Appointments: {appointments.length}</p>
    </div>
  );
}
