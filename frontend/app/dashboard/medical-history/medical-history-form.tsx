"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useAuthContext } from "@/context/AuthContext";
import { useMedicalHistoryContext } from "@/context/MedicalHistoryContext";
import { MedicalHistory } from "@/context/MedicalHistoryContext";
import { add, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ChevronsUpDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MedicalHistoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history?: MedicalHistory | null;
}

export function MedicalHistoryForm({
  open,
  onOpenChange,
  history = null,
}: MedicalHistoryFormProps) {
  const { toast } = useToast();
  const { getAllPatients } = useMedicalHistoryContext();
  const { getDoctorAndPatientAppointments } = useAppointmentsContext();
  const { createMedicalHistory, updateMedicalHistory } =
    useMedicalHistoryContext();
  const { currentUser } = useAuthContext();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [appointments, setAppointments] = useState(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    (async () => {
      const fetchedPatients = await getAllPatients();
      const fetchedAppointments = await getDoctorAndPatientAppointments(
        currentUser._id
      );
      console.log(fetchedAppointments);

      setAppointments(fetchedAppointments);
      setPatients(fetchedPatients);
    })();
  }, []);

  // Filter the patients list based on the search term (searching by email)
  const filteredPatients = patients
    .filter((patient) =>
      patient.email.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 5);

  const router = useRouter();

  function convertUTCToLocal(utcDateString) {
    const utcDate = new Date(utcDateString);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 19);
  }

  useEffect(() => {
    if (history) {
      const localStartTime = convertUTCToLocal(history.startDate);
      const localEndTime = convertUTCToLocal(history.endDate);
      setStartDate(localStartTime);
      setEndDate(localEndTime);
      setSelectedPatient(history.patient._id);
      setDiagnosis(history.diagnosis);
      setDescription(history.description);
    } else {
      setSelectedPatient("");
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
      setDiagnosis("");
      setDescription("");
    }
  }, [history]);

  async function handleSubmit() {
    try {
      if (
        !selectedPatient ||
        !startDate ||
        !endDate ||
        !diagnosis ||
        !description
      ) {
        setError("All fields are required");
        return;
      }

      if (history) {
        await updateMedicalHistory(
          history._id,
          diagnosis,
          description,
          startDate,
          endDate,
          selectedPatient,
          currentUser._id
        );
        toast({
          title: "Success",
          description: "Medical history updated successfully",
        });
      } else {
        await createMedicalHistory(
          selectedPatient,
          currentUser._id,
          startDate,
          endDate,
          diagnosis,
          description
        );
        toast({
          title: "Success",
          description: "Medical history created successfully",
        });
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

  const filteredAppointments = selectedPatient
    ? appointments.filter(
        (appointment) => appointment.patient === selectedPatient
      )
    : [];
  useEffect(() => {
    console.log("filteredAppointments", filteredAppointments);
  }, [filteredAppointments]);
  useEffect(() => {
    console.log(startDate, endDate);
  }, [startDate, endDate]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="-description">
        <DialogHeader>
          <DialogTitle>
            {history ? "Edit Medical History" : "Create Medical History"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" id="-description">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>Patient</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={!!selectedPatient}
                  className="w-full justify-between"
                >
                  {selectedPatient
                    ? patients.find(
                        (patient) => patient._id === selectedPatient
                      )?.fullName
                    : "Select Patient..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-0">
                <Command>
                  <CommandInput
                    placeholder="Search Patient email..."
                    value={search}
                    onValueChange={(val) => setSearch(val)}
                  />
                  <CommandList>
                    {filteredPatients.length > 0 ? (
                      <CommandGroup>
                        {filteredPatients.map((patient) => (
                          <CommandItem
                            key={patient._id}
                            value={patient._id}
                            onSelect={(currentValue) => {
                              setSelectedPatient(currentValue);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedPatient === patient._id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            <div>
                              <p>{patient.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.email}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty>No Patient found.</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment-start-date">
              Select Appointment Start Date
            </Label>
            <Select
              onValueChange={(value) => setStartDate(value)} // Update state on selection
              value={startDate} // Controlled component
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a start date" />
              </SelectTrigger>
              <SelectContent>
                {/* Map through filteredAppointment to render start dates */}
                {filteredAppointments.map((appointment) => (
                  <SelectItem
                    key={appointment._id}
                    value={appointment.startTime}
                  >
                    {format(
                      toZonedTime(
                        new Date(appointment.startTime),
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      ),
                      "dd/MM/yy hh:mm a"
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment-end-date">
              Select Appointment End Date
            </Label>
            <Select
              onValueChange={(value) => setEndDate(value)} // Update state on selection
              value={endDate} // Controlled component
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an end date" />
              </SelectTrigger>
              <SelectContent>
                {/* Map through filteredAppointment to render start dates */}
                {filteredAppointments.map((appointment) => (
                  <SelectItem key={appointment._id} value={appointment.endTime}>
                    {format(
                      toZonedTime(
                        new Date(appointment.endTime),
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      ),
                      "dd/MM/yy hh:mm a"
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              rows={3} // Adjust the number of rows for better height
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3} // Adjust the number of rows for better height
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="my-2 flex-col justify-center"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={[
                selectedPatient,
                startDate,
                endDate,
                diagnosis,
                description,
              ].some((x) => x === "")}
            >
              {history ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}
