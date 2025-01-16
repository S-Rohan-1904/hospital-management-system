"use client";

import { ScansClientPage } from "./scan-client";
import { ScansDoctor } from "./scan-doctor";
import { useAuthContext } from "@/context/AuthContext";

export default function ScansPage() {
  const { currentUser } = useAuthContext();

  return <ScansClientPage />;
}
