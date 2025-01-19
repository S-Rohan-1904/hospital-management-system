"use client";

import DoctorMedicalHistory from "./doctor-medical-history";
import PatientMedicalHistory from "./patient-medical-history";
import { useAuthContext } from "@/context/AuthContext";

export default function MedicalHistoryPage() {
  const { currentUser } = useAuthContext();
  return currentUser && currentUser.role === "doctor" ? (
    <DoctorMedicalHistory />
  ) : (
    <PatientMedicalHistory />
  );
}
