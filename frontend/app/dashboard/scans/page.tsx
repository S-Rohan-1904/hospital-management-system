"use client";

import { ScansClientPage } from "./scan-client";
import { useAuthContext } from "@/context/AuthContext";

export default function ScansPage() {
  const { currentUser } = useAuthContext();

  return <ScansClientPage />;
}
