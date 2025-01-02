"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MoreVertical, Plus } from "lucide-react";
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
import { AppointmentForm } from "./appointment-form";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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

interface AppointmentsClientProps {
  appointments: AppointmentInterface[];
}

export function AppointmentsClient({
  appointments: initialAppointments,
}: AppointmentsClientProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentInterface | null>(null);

  async function handleDelete(id: string) {
    try {
      // await deleteAppointment(id);
      setAppointments(appointments.filter((a) => a._id !== id));
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      // You could add error handling UI here
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Button
          onClick={() => {
            setSelectedAppointment(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment._id}>
                <TableCell className="font-medium">
                  {appointment?.doctor?.fullName}
                </TableCell>
                <TableCell className="font-medium">
                  {appointment?.hospital?.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(
                      toZonedTime(new Date(appointment?.startTime), "UTC"),
                      "EEE MMM dd yyyy"
                    )}{" "}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {format(
                      toZonedTime(new Date(appointment?.startTime), "UTC"),
                      "hh:mm a"
                    )}
                    {" - "}
                    {format(
                      toZonedTime(new Date(appointment?.endTime), "UTC"),
                      "hh:mm a"
                    )}
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
                        }[appointment.status] || "bg-gray-500" // Fallback for unexpected statuses
                      }`}
                    />
                    {appointment.status}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={selectedAppointment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedAppointment && handleDelete(selectedAppointment._id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
