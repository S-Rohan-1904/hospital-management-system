"use client";

import { AppointmentInterface } from "@/app/dashboard/appointments/appointments-client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useHospitalsContext } from "@/context/HospitalsContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { add } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Calendar as CalendarIcon, ClockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// const doctors = [
//   {
//     _id: "doctor1",
//     fullName: "Dr. Jane Smith",
//     email: "jane.smith@example.com",
//     specialization: "Cardiology",
//   },
//   {
//     _id: "doctor2",
//     fullName: "Dr. John Doe",
//     email: "john.doe@example.com",
//     specialization: "Dermatology",
//   },
//   {
//     _id: "doctor3",
//     fullName: "Dr. Emily Davis",
//     email: "emily.davis@example.com",
//     specialization: "Pediatrics",
//   },
//   {
//     _id: "doctor4",
//     fullName: "Dr. Michael Lee",
//     email: "michael.lee@example.com",
//     specialization: "Endocrinology",
//   },
//   {
//     _id: "doctor5",
//     fullName: "Dr. Sarah Johnson",
//     email: "sarah.johnson@example.com",
//     specialization: "Orthopedics",
//   },
//   {
//     _id: "doctor6",
//     fullName: "Dr. Michael Brown",
//     email: "michael.brown@example.com",
//     specialization: "Neurology",
//   },
// ];

// Dummy hospitals with _id and doctors embedded with full info
// const hospitals = [
//   {
//     _id: "hospital1",
//     name: "City General Hospital",
//     address: "123 Main Street, New York, NY",
//     contact: "+1234567890",
//     location: {
//       type: "Point",
//       coordinates: [40.7128, -74.006], // Example coordinates for New York, NY
//     },
//     doctors: [
//       {
//         _id: "doctor1",
//         fullName: "Dr. Jane Smith",
//         email: "jane.smith@example.com",
//         specialization: "Cardiology",
//       },
//       {
//         _id: "doctor2",
//         fullName: "Dr. John Doe",
//         email: "john.doe@example.com",
//         specialization: "Dermatology",
//       },
//       {
//         _id: "doctor3",
//         fullName: "Dr. Emily Davis",
//         email: "emily.davis@example.com",
//         specialization: "Pediatrics",
//       },
//     ],
//   },
//   {
//     _id: "hospital2",
//     name: "Sunnydale Medical Center",
//     address: "456 Sunny Ave, Sunnydale, CA",
//     contact: "+0987654321",
//     location: {
//       type: "Point",
//       coordinates: [34.0522, -118.2437], // Example coordinates for Los Angeles, CA
//     },
//     doctors: [
//       {
//         _id: "doctor4",
//         fullName: "Dr. Michael Lee",
//         email: "michael.lee@example.com",
//         specialization: "Endocrinology",
//       },
//       {
//         _id: "doctor5",
//         fullName: "Dr. Sarah Johnson",
//         email: "sarah.johnson@example.com",
//         specialization: "Orthopedics",
//       },
//     ],
//   },
//   {
//     _id: "hospital3",
//     name: "Green Valley Hospital",
//     address: "789 Green Rd, Green Valley, IL",
//     contact: "+1122334455",
//     location: {
//       type: "Point",
//       coordinates: [41.8781, -87.6298], // Example coordinates for Chicago, IL
//     },
//     doctors: [
//       {
//         _id: "doctor6",
//         fullName: "Dr. Michael Brown",
//         email: "michael.brown@example.com",
//         specialization: "Neurology",
//       },
//     ],
//   },
// ];

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
  const { hospitals } = useHospitalsContext();
  useEffect(() => {
    console.log(hospitals);

    console.log("selectedHospital", selectedHospital);
  });

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
  const { toast } = useToast();

  const handleSelectChangeHospital = (value) => {
    setSelectedHospital(value);
  };

  const handleSelectChangeDoctor = (value) => {
    console.log(value);

    setSelectedDoctor(value);
  };

  useEffect(() => {
    if (appointment) {
      setStartDate(appointment.startTime);
      setEndDate(appointment.endTime);
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
      if (appointment) {
        await updateAppointment({
          id: appointment._id,
          startTime: startDate,
          endTime: endDate,
          doctorId: selectedDoctor,
          hospitalId: selectedHospital,
        });
      } else {
        await requestAppointment({
          startTime: startDate,
          endTime: endDate,
          doctorId: selectedDoctor,
          hospitalId: selectedHospital,
        });

        console.log("appointment request created");
      }
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue with your request. Please try again.",
        variant: "destructive", // This can be a different variant like 'destructive' for errors
      });
      console.error("Error submitting form:", error);
      // You could add error handling UI here
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
            <Button type="submit">{appointment ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
