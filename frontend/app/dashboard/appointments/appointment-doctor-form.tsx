"use client";

import { AppointmentInterface } from "./appointments-doctor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { add } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: AppointmentInterface | null;
}

export function AppointmentDoctorForm({
  open,
  onOpenChange,
  appointment = null,
}: AppointmentFormProps) {
  const { updateDoctorAppointment } = useAppointmentsContext();
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

  const [description, setDescription] = useState<string>("");
  const { toast } = useToast();

  function convertUTCToLocal(utcDateString) {
    const utcDate = new Date(utcDateString);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );
    console.log(localDate.toISOString().slice(0, 19));

    return localDate.toISOString().slice(0, 19);
  }

  useEffect(() => {
    if (appointment) {
      const localStartTime = convertUTCToLocal(appointment.startTime);
      const localEndTime = convertUTCToLocal(appointment.endTime);
      console.log(localStartTime, localEndTime);

      setStartDate(localStartTime);
      setEndDate(localEndTime);
      setDescription(appointment.description);
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
    }
  }, [appointment]);

  const router = useRouter();

  async function handleSubmit() {
    try {
      if (appointment) {
        const localStartDate = convertUTCToLocal(startDate);
        const localEndDate = convertUTCToLocal(endDate);
        await updateDoctorAppointment({
          id: appointment._id,
          startTime: localStartDate,
          endTime: localEndDate,
          description,
        });
      }
      console.log("appointment updated");

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
          <DialogTitle>Update Appointment</DialogTitle> {/* Dialog title */}
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" id="-description">
          <div className="space-y-2 w-[75%]">
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

          <div className="space-y-2 w-[75%]">
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

          <div className="space-y-2 w-[75%]">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={[startDate, endDate].some((x) => x === "")}
            >
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
