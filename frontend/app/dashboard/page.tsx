"use client";

import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useEffect } from "react";

export default function DashboardPage() {
  const { appointments, loading, error } = useAppointmentsContext(); // Use the hook

  useEffect(() => {
    console.log(appointments);
  }, [appointments]);

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
