"use client";

import Loading from "../loading";
import { AppointmentDoctorForm } from "./appointment-doctor-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useHospitalsContext } from "@/context/HospitalsContext";
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface AppointmentInterface {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
  };
  doctor: {
    _id: string;
    fullName: string;
    email: string;
    specialization: string;
  };
  hospital: {
    _id: string;
    name: string;
    address: string;
  };
}

export function AppointmentsDoctor() {
  const router = useRouter();
  const {
    appointments,
    loading,
    error,
    fetchAppointments,
    acceptAppointment,
    rejectAppointment,
  } = useAppointmentsContext();
  const { fetchHospitals } = useHospitalsContext();

  const [formOpen, setFormOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentInterface | null>(null);

  useEffect(() => {
    fetchAppointments();
    fetchHospitals();
  }, []);

  // Function to handle deleting an appointment
  const acceptAppointmentHandler = async (selectedAppointmentId: string) => {
    try {
      const response = await acceptAppointment(selectedAppointmentId);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  const rejectAppointmentHandler = async (selectedAppointmentId: string) => {
    try {
      const response = await rejectAppointment(selectedAppointmentId);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment._id}>
                <TableCell className="font-medium">
                  {appointment?.patient?.fullName}
                </TableCell>

                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(
                      new Date(appointment?.startTime),
                      "dd/MM/yyyy"
                    )}{" "}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {format(new Date(appointment?.startTime), "hh:mm a")}
                    {" - "}
                    {format(new Date(appointment?.endTime), "hh:mm a")}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        {
                          scheduled: "bg-green-500",
                          rescheduled: "bg-orange-500",
                          pending: "bg-yellow-500",
                          rejected: "bg-red-500",
                        }[appointment.status] || "bg-gray-500"
                      }`}
                    />
                    {appointment.status}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="default"
                    className="bg-green-400 hover:bg-green-500"
                    onClick={() => acceptAppointmentHandler(appointment._id)}
                    disabled={appointment.status !== "pending"}
                  >
                    Approve
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => rejectAppointmentHandler(appointment._id)}
                    disabled={appointment.status !== "pending"}
                  >
                    Reject
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="default"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setFormOpen(true);
                    }}
                  >
                    Update Appointment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AppointmentDoctorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={selectedAppointment}
      />
    </>
  );
}
