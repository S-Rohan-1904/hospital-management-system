"use client";

import Loading from "../loading";
import { ScanDescription } from "./scan-description";
import { ScanForm } from "./scan-form";
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
import { Scan } from "@/context/ScansContext";
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ScansDoctor() {
  const router = useRouter();
  const { appointments } = useAppointmentsContext();
  const { scans, loading, error, fetchScan, deleteScan } = useScansContext();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [showDescription, setShowDescription] = useState<boolean>(false);

  useEffect(() => {
    fetchScan();
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteScan(id);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
    }
  }

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scans</h1>

        <Button
          onClick={() => {
            setSelectedScan(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Scan
        </Button>
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
              <TableHead>Scan Centre</TableHead>
              <TableHead>Date of Creation</TableHead>
              <TableHead>Date of Upload</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan) => (
              <TableRow key={scan._id}>
                <TableCell className="font-medium">
                  {scan?.patient?.fullName}
                </TableCell>
                <TableCell className="font-medium">
                  {scan?.scanCentre?.fullName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(scan?.createdAt), "dd/MM/yyyy")}{" "}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {format(new Date(scan?.createdAt), "hh:mm a")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(scan?.dateOfUpload), "dd/MM/yyyy")}{" "}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {format(new Date(scan?.dateOfUpload), "hh:mm a")}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        {
                          completed: "bg-green-500",
                          accepted: "bg-orange-500",
                          pending: "bg-yellow-500",
                          rejected: "bg-red-500",
                        }[scan.status] || "bg-gray-500"
                      }`}
                    />
                    {scan.status}
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
                      {scan.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedScan(scan);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      {scan?.description && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedScan(scan);
                            setShowDescription(true);
                          }}
                        >
                          Show Description
                        </DropdownMenuItem>
                      )}
                      {scan.status === "pending" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedScan(scan);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={scan.status !== "pending"}
                        >
                          Delete
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

      <ScanDescription
        open={showDescription}
        onOpenChange={setShowDescription}
        description={selectedScan?.description}
      />

      <ScanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        scan={selectedScan}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedScan && handleDelete(selectedScan._id)}
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
