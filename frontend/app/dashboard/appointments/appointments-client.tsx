"use client";

import PaymentButton from "@/components/payment-button";
import Loading from "../loading";
import { AppointmentDescription } from "./appointment-description";
import { AppointmentForm } from "./appointment-form";
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
import { Payment, useAppointmentsContext } from "@/context/AppointmentsContext";
import { useHospitalsContext } from "@/context/HospitalsContext";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
  description?: string;
  payment: Payment;
  onlineAppointment: boolean;
}

export function AppointmentsClient() {
  const router = useRouter();
  const { appointments, loading, error, deleteAppointment, fetchAppointments } =
    useAppointmentsContext();
  const { fetchHospitals } = useHospitalsContext();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentInterface | null>(null);
  const [showDescription, setShowDescription] = useState<boolean>(false);

  useEffect(() => {
    fetchAppointments();
    fetchHospitals();
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteAppointment(id);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
    }
  }

  const handleDownload = (scanDocument) => {
    const anchor = document.createElement("a");
    anchor.href = scanDocument;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = "";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (loading) {
    return <Loading />;
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
          Request Appointment
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="my-2 flex-col justify-center">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Appointment Status</TableHead>
              <TableHead>Scan Request Status</TableHead>
              <TableHead>Scan Request Created At</TableHead>
              <TableHead>Scan Request Uploaded At</TableHead>
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
                  <div className="flex items-center">
                    {appointment.hasScanRequest ? (
                      <>
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${
                            {
                              completed: "bg-green-500",
                              accepted: "bg-orange-500",
                              pending: "bg-yellow-500",
                              rejected: "bg-red-500",
                            }[appointment.scanRequest.status] || "bg-gray-500"
                          }`}
                        />
                        {appointment.scanRequest.status}
                      </>
                    ) : (
                      <div className="flex items-center text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    {appointment.hasScanRequest ? (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(
                          toZonedTime(
                            new Date(appointment.scanRequest.createdAt),
                            Intl.DateTimeFormat().resolvedOptions().timeZone
                          ),
                          "dd/MM/yyyy"
                        )}
                      </>
                    ) : (
                      <div className="flex items-center">N/A</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    {appointment.hasScanRequest &&
                    appointment.scanRequest.dateOfUpload ? (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(
                          toZonedTime(
                            new Date(appointment.scanRequest.dateOfUpload),
                            Intl.DateTimeFormat().resolvedOptions().timeZone
                          ),
                          "dd/MM/yyyy"
                        )}
                      </>
                    ) : (
                      <div className="flex items-center">N/A</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {appointment.payment &&
                    appointment.payment.orderId &&
                    appointment.status === "payment pending" && (
                      <PaymentButton
                        amount={500}
                        type="appointment"
                        id="123456"
                        appointment={appointment}
                      />
                    )}
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
                      {appointment.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      {appointment?.description && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDescription(true);
                          }}
                        >
                          Show Description
                        </DropdownMenuItem>
                      )}
                      {appointment.hasScanRequest &&
                        appointment.scanRequest.status === "completed" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleDownload(
                                appointment?.scanRequest?.scanDocument
                              )
                            }
                          >
                            Download Scan
                          </DropdownMenuItem>
                        )}
                      {appointment.status === "pending" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={appointment.status !== "pending"}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                      {["scheduled", "reschedeled"].includes(
                        appointment.status
                      ) &&
                        appointment.onlineAppointment && (
                          <DropdownMenuItem onClick={() => {}}>
                            Reschedule
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AppointmentDescription
        open={showDescription}
        onOpenChange={setShowDescription}
        description={selectedAppointment?.description}
      />

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
