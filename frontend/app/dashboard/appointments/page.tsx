"use client";

import { AppointmentsClient } from "./appointments-client";
import { AppointmentsDoctor } from "./appointments-doctor";
import { useAuthContext } from "@/context/AuthContext";

export default function AppointmentsPage() {
  const { currentUser } = useAuthContext();

  return currentUser && currentUser.role === "doctor" ? (
    <AppointmentsDoctor />
  ) : (
    <AppointmentsClient />
  );
}
