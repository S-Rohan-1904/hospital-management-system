"use client";

import Loading from "./loading";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LatestItemCard from "@/components/latest-item"; // Assuming you've created the LatestItemCard
import { useRoomManagementContext } from "@/context/RoomManagementContext";
import { useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { ScansClientPage } from "./scans/scan-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useScansContext } from "@/context/ScansContext";
export default function Dashboard() {
  const { appointments, loading, error } = useAppointmentsContext();
  const { isAuthenticated, authLoading, currentUser } = useAuthContext();
  const { getPendingPayments, pendingPayments, wards } =
    useRoomManagementContext();
  const { scans } = useScansContext();
  const router = useRouter();

  // If auth check is still loading, show a loading state
  if (authLoading) {
    return <Loading />;
  }

  // Logic to determine the latest appointment
  let latestItem = null;

  console.log(currentUser?.role);
  if (currentUser?.role === "doctor" || currentUser?.role === "patient") {
    latestItem = appointments?.[appointments.length - 1]; // Get the latest appointment
  }

  if (currentUser?.role === "hospitalAdmin") {
    latestItem = wards;
    if (!latestItem) {
      return (
        <>
          <h1>Dashboard</h1>
          <Card className="bg-black-500 text-white p-6 shadow-md mt-10">
            <CardHeader>
              <CardTitle>Could Not fetch the available ward details</CardTitle>
              <CardDescription>Please try again later</CardDescription>
            </CardHeader>
          </Card>
        </>
      );
    }

    return (
      <>
        <h1>Dashboard</h1>
        <Card className="bg-black-500 text-white p-6 shadow-lg hover:shadow-xl transition-shadow mt-10">
          <CardHeader>
            <CardTitle>Wards Available</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <p>
                <strong>ICU Beds available:</strong>{" "}
                {latestItem.wardDetails["ICU"].unoccupiedBeds}
              </p>
              <p>
                <strong>General Ward Beds available:</strong>{" "}
                {latestItem.wardDetails["General Ward"].unoccupiedBeds}
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (currentUser?.role === "scanCentre") {
    latestItem = scans?.[scans.length - 1];
    if (!latestItem) {
      return (
        <>
          <h1>Dashboard</h1>
          <Card className="bg-black-500 text-white p-6 shadow-md mt-10">
            <CardHeader>
              <CardTitle>No Latest Scans Available</CardTitle>
              <CardDescription>
                There are no scans at the moment.
              </CardDescription>
            </CardHeader>
          </Card>
        </>
      );
    }

    return (
      <>
        <h1>Dashboard</h1>
        <Card className="bg-black-500 text-white p-6 shadow-lg hover:shadow-xl transition-shadow mt-10">
          <CardHeader>
            <CardTitle>Latest Scan</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(latestItem.createdAt).toLocaleDateString()}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <>
                <p>
                  <strong>Hospital:</strong> {latestItem.hospital.name}
                </p>
                <p>
                  <strong>Doctor:</strong> {latestItem.doctor.fullName}
                </p>
                <p>
                  <strong>Patient:</strong> {latestItem.patient.fullName}
                </p>
                <p>
                  <strong>Status:</strong> {latestItem.status}
                </p>
              </>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Render loading, error, or appointments based on the state
  if (loading) {
    return <Loading />;
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
