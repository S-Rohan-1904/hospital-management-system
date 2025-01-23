"use client";

import Loading from "../loading";
import { AppointmentDoctorForm } from "./appointment-doctor-form";
import { ScanDoctorForm } from "./scan-doctor-form";
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
import { useScansContext } from "@/context/ScansContext";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AlertCircle, Calendar, Clock, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export interface AppointmentInterface {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
  description?: string;
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
  hasScanRequest: boolean;
  scanRequest: {
    _id: string;
    patient: string;
    doctor: string;
    hospital: string;
    scanCentre: string;
    scanDocument: string;
    appointment: string;
    dateOfUpload: string;
    description: string;
    status: string;
  };
}

export function AppointmentsDoctor() {
  const { toast } = useToast();
  const {
    appointments,
    loading,
    error,
    fetchAppointments,
    acceptAppointment,
    rejectAppointment,
  } = useAppointmentsContext();

  const [formOpen, setFormOpen] = useState(false);
  const [scanRequestFormOpen, setScanRequestFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentInterface | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const { deleteScan } = useScansContext();

  const router = useRouter();
  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    console.log(appointments);
  }, [appointments]);

  const handleDownload = (scanDocument) => {
    // Trigger the download programmatically
    const anchor = document.createElement("a");
    anchor.href = scanDocument;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = "";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  async function handleDelete(id: string) {
    try {
      await deleteScan(id);
      toast({
        title: "Scan Deleted",
        description: "Scan deleted successfully",
      });
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
    }
  }
  const acceptAppointmentHandler = async (selectedAppointmentId: string) => {
    try {
      const response = await acceptAppointment(selectedAppointmentId);
      toast({
        title: "Appointment Accepted",
        description: "Appointment accepted successfully",
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  const rejectAppointmentHandler = async (selectedAppointmentId: string) => {
    try {
      const response = await rejectAppointment(selectedAppointmentId);
      toast({
        title: "Appointment Rejected",
        description: "Appointment rejected successfully",
      });
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
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
                  {appointment?.patient?.fullName}
                </TableCell>

                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(
                      toZonedTime(
                        new Date(appointment?.startTime),
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      ),
                      "dd/MM/yyyy"
                    )}{" "}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {format(
                      toZonedTime(
                        new Date(appointment?.startTime),
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      ),
                      "hh:mm a"
                    )}
                    {" - "}
                    {format(
                      toZonedTime(
                        new Date(appointment?.endTime),
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      ),
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
                          onClick={() =>
                            acceptAppointmentHandler(appointment._id)
                          }
                        >
                          Approve Appointment
                        </DropdownMenuItem>
                      )}
                      {appointment.status === "pending" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            rejectAppointmentHandler(appointment._id)
                          }
                        >
                          Reject Appointment
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

                      {["scheduled", "rescheduled"].includes(
                        appointment.status
                      ) && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setFormOpen(true);
                          }}
                        >
                          Update Appointment
                        </DropdownMenuItem>
                      )}

                      {!appointment.hasScanRequest &&
                        ["scheduled", "rescheduled"].includes(
                          appointment.status
                        ) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setScanRequestFormOpen(true);
                            }}
                          >
                            Create Scan Request
                          </DropdownMenuItem>
                        )}

                      {appointment.hasScanRequest &&
                        appointment.scanRequest.status !== "completed" &&
                        ["scheduled", "rescheduled"].includes(
                          appointment.status
                        ) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setScanRequestFormOpen(true);
                            }}
                            disabled={
                              appointment.hasScanRequest &&
                              appointment.scanRequest.status === "completed"
                            }
                          >
                            {appointment.hasScanRequest
                              ? "Update Scan Request"
                              : "Create Scan Request"}
                          </DropdownMenuItem>
                        )}
                      {appointment.hasScanRequest &&
                        ["rejected", "pending"].includes(
                          appointment?.scanRequest?.status
                        ) && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={
                              !appointment.hasScanRequest ||
                              (appointment.hasScanRequest &&
                                appointment.scanRequest.status === "completed")
                            }
                          >
                            Delete Scan Request
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

      <AppointmentDoctorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={selectedAppointment}
      />

      <ScanDoctorForm
        open={scanRequestFormOpen}
        onOpenChange={setScanRequestFormOpen}
        appointmentId={selectedAppointment?._id}
        scan={
          selectedAppointment?.hasScanRequest
            ? selectedAppointment?.scanRequest
            : null
        }
        setSelectedAppointment={setSelectedAppointment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this Scan Request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedAppointment.scanRequest &&
                handleDelete(selectedAppointment.scanRequest?._id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </>
  );
}
