"use client";

import Loading from "./loading";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

export default function DashboardPage() {
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
      {currentUser.role === "scanCentre" ? (
        <div>
          <h1>Scan Centre Dashboard</h1>
        </div>
      ) : (
        <div>
          <h1>Dashboard</h1>
          <p>Appointments: {appointments.length}</p>
        </div>
      )}
    </div>
  );
}
