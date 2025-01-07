"use client";

import { useAppointmentsContext } from "@/context/AppointmentsContext";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

export default function DashboardPage() {
  const { appointments, loading, error } = useAppointmentsContext();
  const { isAuthenticated, authLoading, currentUser } = useAuth(); // Access currentUser

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Authenticated user:", currentUser);
    }
  }, [isAuthenticated, currentUser]);

  // If auth check is still loading, show a loading state
  if (authLoading) {
    return <div>Loading...</div>;
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
      <h1>Appointments</h1>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>
            <strong>{appointment.patient.fullName}</strong> (
            {appointment.patient.email}) - {appointment.status}
            <br />
            Doctor: {appointment.doctor.fullName} (
            {appointment.doctor.specialization})
            <br />
            Hospital: {appointment.hospital.name} (
            {appointment.hospital.address})
            <br />
            Start Time: {new Date(appointment.startTime).toLocaleString()}
            <br />
            End Time: {new Date(appointment.endTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
