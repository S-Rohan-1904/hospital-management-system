"use client";

import Loading from "../loading";
import { ScanDescription } from "./scan-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useScansContext } from "@/context/ScansContext";
import { format } from "date-fns";
import { AlertCircle, Clock, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export interface ScanInterface {
  _id: string;
  description: string;
  patient: {
    _id: string;
    email: string;
    fullName: string;
    avatar: string;
    address: string;
    role: string;
    gender: string;
    createdAt: string;
    updatedAt: string;
  };
  doctor: {
    _id: string;
    email: string;
    fullName: string;
    avatar: string;
    role: string;
    specialization: string;
    createdAt: string;
    updatedAt: string;
  };
  scanCentre: {
    _id: string;
    email: string;
    fullName: string;
    avatar: string;
    address: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  hospital: {
    _id: string;
    name: string;
    address: string;
    contact: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  status: string;
  createdAt?: string;
  updatedAt: string;
  dateOfUpload?: string;
  scanDocument?: string;
  isCompleted: boolean;
}

export function ScansClientPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { completeScan, updateScanDocument, loading, error } =
    useScansContext();
  const [selectedScan, setSelectedScan] = useState<ScanInterface | null>(null);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("scanDocument", selectedFile); // Match the backend's key for the file.

    try {
      console.log(selectedScan);
      let response;
      if (selectedScan.status === "accepted") {
        response = await completeScan(formData, selectedScan?._id);
        toast({
          title: "Success",
          description: "Scan completed successfully.",
        });
      } else {
        response = await updateScanDocument(formData, selectedScan?._id);
        toast({
          title: "Success",
          description: "Scan document updated successfully.",
        });
      }
      if (response) {
        console.log("Upload successful:", response);
        router.refresh();
        await fetchScan();
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const { scans, fetchScan, acceptScan, rejectScan } = useScansContext();
  useEffect(() => {
    fetchScan();
  }, []);

  useEffect(() => {
    console.log(scans);
  }, [scans]);

  const acceptScanHandler = async (selectedScanId: string) => {
    try {
      const response = await acceptScan(selectedScanId);
      toast({
        title: "Scan Accepted",
        description: "Scan accepted successfully",
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  const rejectScanHandler = async (selectedScanId: string) => {
    try {
      const response = await rejectScan(selectedScanId);
      toast({
        title: "Scan Rejected",
        description: "Scan rejected successfully",
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
        <h1 className="text-2xl font-bold">Scans</h1>
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
              <TableHead>Doctor</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Updated At</TableHead>
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
                  {scan?.doctor?.fullName}
                </TableCell>
                <TableCell className="font-medium">
                  {scan?.hospital.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    {format(new Date(scan?.updatedAt), "dd/MM/yyyy")}{" "}
                    {format(new Date(scan?.updatedAt), "hh:mm a")}
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
                  <Button
                    variant="default"
                    className="bg-green-400 hover:bg-green-500"
                    onClick={() => acceptScanHandler(scan._id)}
                    disabled={scan.status !== "pending"}
                  >
                    Approve
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => rejectScanHandler(scan._id)}
                    disabled={scan.status !== "pending"}
                  >
                    Reject
                  </Button>
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
                      {scan?.status === "accepted" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedScan(scan);
                            setDialogOpen(true);
                          }}
                        >
                          Upload Scan Document
                        </DropdownMenuItem>
                      )}
                      {scan?.status === "completed" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedScan(scan);
                            setDialogOpen(true);
                          }}
                        >
                          Update Scan Document
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedScan?.status === "accepted"
                ? "Upload Scan Document"
                : "Update Scan Document"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Select a file to upload
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="block w-full"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected file: {selectedFile.name}
              </p>
            )}
            <Button
              onClick={async () => {
                await handleUpload(); // Trigger the upload.
                handleDialogClose(); // Close the dialog only after the upload is done.
              }}
              disabled={!selectedFile}
            >
              Upload File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
