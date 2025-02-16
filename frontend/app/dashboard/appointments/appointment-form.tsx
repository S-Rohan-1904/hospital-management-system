"use client";

import { AppointmentInterface } from "@/app/dashboard/appointments/appointments-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useHospitalsContext } from "@/context/HospitalsContext";
import { format } from "date-fns";
import { add } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: AppointmentInterface | null;
}

export function AppointmentForm({
  open,
  onOpenChange,
  appointment = null,
}: AppointmentFormProps) {
  const { toast } = useToast();
  const { hospitals } = useHospitalsContext();

  const { requestAppointment, updateAppointment } = useAppointmentsContext();
  const [startDate, setStartDate] = useState<string>(
    format(
      toZonedTime(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
    )
  );

  const [endDate, setEndDate] = useState<string>(
    format(
      toZonedTime(
        add(new Date(), { minutes: 30 }),
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
    )
  );

  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isOnlineAppointment, setIsOnlineAppointment] =
    useState<boolean>(false);

  const handleSelectChangeHospital = (value) => {
    setSelectedHospital(value);
  };

  const handleSelectChangeDoctor = (value) => {
    setSelectedDoctor(value);
  };

  function convertUTCToLocal(utcDateString) {
    const utcDate = new Date(utcDateString);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 19);
  }

  useEffect(() => {
    if (appointment) {
      const localStartTime = convertUTCToLocal(appointment.startTime);
      const localEndTime = convertUTCToLocal(appointment.endTime);
      setStartDate(localStartTime);
      setEndDate(localEndTime);
      setSelectedHospital(appointment?.hospital?._id);
      setSelectedDoctor(appointment?.doctor?._id);
    } else {
      setStartDate(
        format(
          toZonedTime(
            new Date(),
            Intl.DateTimeFormat().resolvedOptions().timeZone
          ),
          "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
        )
      );
      setEndDate(
        format(
          toZonedTime(
            add(new Date(), { minutes: 30 }),
            Intl.DateTimeFormat().resolvedOptions().timeZone
          ),
          "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
        )
      );
      setSelectedHospital("");
      setSelectedDoctor("");
    }
  }, [appointment]);

  const router = useRouter();

  async function handleSubmit() {
    try {
      if (startDate > endDate) {
        toast({
          title: "Error",
          description: "End Time must be after start time",
          variant: "destructive",
        });
        return;
      }
      if (appointment) {
        const localStartDate = convertUTCToLocal(startDate);
        const localEndDate = convertUTCToLocal(endDate);
        await updateAppointment({
          id: appointment._id,
          startTime: localStartDate,
          endTime: localEndDate,
          doctor: selectedDoctor,
          hospital: selectedHospital,
        });
        toast({
          title: "Appointment Updated",
          description: "The appointment was successfully updated",
          duration: 3000,
        });
      } else {
        const localStartDate = convertUTCToLocal(startDate);
        const localEndDate = convertUTCToLocal(endDate);
        await requestAppointment({
          startTime: localStartDate,
          endTime: localEndDate,
          doctorId: selectedDoctor,
          hospitalId: selectedHospital,
          onlineAppointment: isOnlineAppointment,
        });

        toast({
          title: "Appointment Requested",
          description: "The appointment request was successfully created.",
          duration: 3000,
        });

        console.log("appointment request created");
      }
      router.refresh();
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
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Create Appointment"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" id="-description">
          <div className="flex items-center justify-between w-[45%]">
            <Label htmlFor="online-appointment">Online Appointment</Label>
            <Switch
              id="online-appointment"
              checked={isOnlineAppointment}
              onCheckedChange={(value) => setIsOnlineAppointment(value)}
            />
          </div>

          <div className="space-y-2 w-[45%]">
            <Label htmlFor="start-date">Start Date & Time</Label>
            <Input
              id="start-date"
              name="start-date"
              type="datetime-local"
              required
              value={startDate.slice(0, 16)}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 w-[45%]">
            <Label htmlFor="end-date">End Date & Time</Label>
            <Input
              id="end-date"
              name="end-date"
              type="datetime-local"
              required
              value={endDate.slice(0, 16)}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="space-y-2 w-[45%]">
            <Label htmlFor="hospital">Hospital</Label>
            <Select
              name="hospital"
              value={selectedHospital}
              onValueChange={(value) => handleSelectChangeHospital(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a hospital" />
              </SelectTrigger>

              <SelectContent>
                {hospitals.map((hospital, index) => (
                  <SelectItem value={hospital._id} key={index}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-[45%]">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              name="doctor"
              value={selectedDoctor}
              onValueChange={handleSelectChangeDoctor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a doctor" />
              </SelectTrigger>

              <SelectContent>
                {hospitals
                  .filter((hospital) => hospital._id === selectedHospital)
                  .map((hospital) =>
                    hospital.doctors.map((doctor, index) => (
                      <SelectItem value={doctor._id} key={index}>
                        {doctor.fullName}
                      </SelectItem>
                    ))
                  )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={[
                selectedHospital,
                selectedDoctor,
                startDate,
                endDate,
              ].some((x) => x === "")}
            >
              {appointment ? "Update" : "Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}
