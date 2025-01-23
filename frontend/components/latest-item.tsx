"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { Appointment } from "@/context/AppointmentsContext";
import { Role } from "@/context/AuthContext"; // Import Role from your context
import { useEffect } from "react";

interface LatestItemCardProps {
  latestItem: Appointment | null;
}

export default function LatestItemCard({ latestItem }: LatestItemCardProps) {
  useEffect(() => {
    console.log(latestItem);
  }, []);

  if (!latestItem) {
    return (
      <Card className="bg-black-500 text-white p-6 shadow-md mt-10">
        <CardHeader>
          <CardTitle>No Latest Appointment Available</CardTitle>
          <CardDescription>
            There are no appointments at the moment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-black-500 text-white p-6 shadow-lg hover:shadow-xl transition-shadow mt-10">
      <CardHeader>
        <CardTitle>Latest Appointment</CardTitle>
        <CardDescription className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(latestItem.startTime).toLocaleDateString()}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <>
            <p>
              <strong>Patient:</strong> {latestItem.patient.fullName}
            </p>
            <p>
              <strong>Status:</strong> {latestItem.status}
            </p>
            <p>
              <strong>Appointment Time:</strong>{" "}
              {new Date(latestItem.startTime).toLocaleString()} -{" "}
              {new Date(latestItem.endTime).toLocaleString()}
            </p>
          </>
        </div>
      </CardContent>
    </Card>
  );
}
