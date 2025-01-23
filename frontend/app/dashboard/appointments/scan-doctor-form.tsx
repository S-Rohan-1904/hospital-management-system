"use client";

import { AppointmentInterface } from "@/app/dashboard/appointments/appointments-doctor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useScansContext } from "@/context/ScansContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export interface ScanInterface {
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
}
interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  scan: ScanInterface | null;
  setSelectedAppointment: (appointment: AppointmentInterface | null) => void;
}

export function ScanDoctorForm({
  open,
  onOpenChange,
  appointmentId,
  scan = null,
  setSelectedAppointment,
}: AppointmentFormProps) {
  const { toast } = useToast();
  const { requestScan, updateScan, scanCentres } = useScansContext();
  const [scanDescription, setScanDescription] = useState(
    scan?.description || ""
  );
  const [selectedScanCentre, setSelectedScanCentre] = useState<string>("");
  const { fetchAppointments } = useAppointmentsContext();

  useEffect(() => {
    if (scan) {
      setScanDescription(scan.description);
      setSelectedScanCentre(scan.scanCentre);
    } else {
      setScanDescription("");
      setSelectedScanCentre("");
    }
  }, [appointmentId]);

  useEffect(() => {
    console.log(scan);
  }, [scan]);

  useEffect(() => {
    console.log(selectedScanCentre);
  }, [selectedScanCentre]);

  const router = useRouter();

  async function handleSubmit() {
    try {
      if (scan) {
        await updateScan({
          id: scan._id,
          description: scanDescription,
          scanCentre: selectedScanCentre,
        });
        toast({
          title: "Success",
          description: "Scan request updated successfully",
        });
        await fetchAppointments();
        console.log("Scan request updated");
      } else {
        await requestScan({
          scanCentre: selectedScanCentre,
          appointment: appointmentId,
          description: scanDescription,
        });
        toast({
          title: "Success",
          description: "Scan request submitted successfully",
        });
        await fetchAppointments();
      }
      router.refresh();
      setSelectedAppointment(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue with your request. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="-description">
        <DialogHeader>
          <DialogTitle>{scan ? "Edit Scan" : "Create Scan"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" id="-description">
          <div className="space-y-2 w-[45%]">
            <Label htmlFor="scan">Scan Centre</Label>
            <Select
              name="scan"
              value={selectedScanCentre}
              onValueChange={(value) => setSelectedScanCentre(value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a scan" />
              </SelectTrigger>

              <SelectContent>
                {scanCentres.map((scanCentre, index) => (
                  <SelectItem value={scanCentre._id} key={index}>
                    {scanCentre.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-[45%]">
            <Label htmlFor="scan-description">Description</Label>
            <Textarea
              value={scanDescription}
              onChange={(e) => setScanDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={[scanDescription, selectedScanCentre].some(
                (x) => x === ""
              )}
            >
              {scan ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}
