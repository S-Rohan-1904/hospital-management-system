"use client";

// Import file-saver
import { MedicalHistoryForm } from "./medical-history-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppointmentsContext } from "@/context/AppointmentsContext";
import { useAuthContext } from "@/context/AuthContext";
import {
  MedicalHistory,
  useMedicalHistoryContext,
} from "@/context/MedicalHistoryContext";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
  FileText,
  Calendar,
  ChevronsUpDown,
  Check,
  Download,
  X,
  Plus,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DoctorMedicalHistory() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedMedicalHistory, setSelectedMedicalHistory] =
    useState<MedicalHistory>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    medicalHistory,
    fetchMedicalHistory,
    getAllPatients,
    getMedicalHistoryPDF,
    deleteMedicalHistory,
    error,
  } = useMedicalHistoryContext();
  const { currentUser } = useAuthContext();

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    (async () => {
      const fetchedPatients = await getAllPatients();
      setPatients(fetchedPatients);
    })();
  }, []);

  // Filter the patients list based on the search term (searching by email)
  const filteredPatients = patients
    .filter((patient) =>
      patient.email.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 5);

  // Fetch medical history when the component mounts
  useEffect(() => {
    (async () => {
      await fetchMedicalHistory(currentUser._id, currentUser.role);
    })();
  }, [currentUser]);

  // Filter medical history by selected patient if one is selected
  const filteredMedicalHistory = selectedPatient
    ? medicalHistory.filter(
        (record) => record.patient.email === selectedPatient
      )
    : medicalHistory;

  // Mock function to handle report download
  const handleDownloadReport = async () => {
    const medicalHistoryPDFUrl = await getMedicalHistoryPDF(selectedPatient);
    console.log(medicalHistoryPDFUrl);

    if (medicalHistoryPDFUrl) {
      const anchor = document.createElement("a");
      anchor.href = medicalHistoryPDFUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.download = "";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const router = useRouter();

  const handleDeleteMedicalHistory = async (id: string) => {
    try {
      await deleteMedicalHistory(id, currentUser._id);
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting medical history:", error);
      alert("Failed to delete medical history.");
    }
  };

  // Function to download scan documents as a zip file
  const handleDownloadScanDocuments = async (scanDocuments) => {
    const zip = new JSZip();
    const folder = zip.folder("scan_documents");
    // Add each scan document to the zip folder
    console.log(scanDocuments);

    for (let i = 0; i < scanDocuments.length; i++) {
      const url = scanDocuments[i];
      const response = await fetch(url);
      const blob = await response.blob();
      folder.file(`scan_${i + 1}.pdf`, blob); // Assuming jpg files, adjust as needed
    }

    // Generate the zip file and download it
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "scan_documents.zip");
    });
  };

  // Clear the selected patient
  const handleClearSearch = () => {
    setSelectedPatient("");
    setSearch("");
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medical History</h1>
        <Button
          onClick={() => {
            setSelectedMedicalHistory(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Medical History
        </Button>
      </div>

      {/* Patient Selection Dropdown */}
      <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[20rem] justify-between"
            >
              {selectedPatient
                ? patients.find((patient) => patient.email === selectedPatient)
                    ?.fullName
                : "Select Patient..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[20rem] p-0">
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
                        value={patient.email}
                        onSelect={(currentValue) => {
                          setSelectedPatient(
                            currentValue === selectedPatient ? "" : currentValue
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPatient === patient._id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div>
                          {/* Show patient's full name and email in the dropdown */}
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

        {/* Download Report Button */}
        {selectedPatient && (
          <>
            {filteredMedicalHistory.length > 0 && (
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleDownloadReport}
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
            {/* Clear Search Button */}
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-red-500"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              Clear Search
            </Button>
          </>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="my-2 flex-col justify-center">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Medical History List */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredMedicalHistory.length > 0 ? (
          filteredMedicalHistory.map((medicalHistory) => (
            <Card key={medicalHistory._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {medicalHistory.diagnosis}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3>Patient Name: {medicalHistory.patient.fullName}</h3>
                  <div className="flex items-center gap-2 flex-row">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(medicalHistory.startDate), "P")}
                    </div>
                    {" - "}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(medicalHistory.endDate), "P")}
                    </div>
                  </div>
                  <p className="text-sm">{medicalHistory.description}</p>
                  <Button
                    variant="default"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSelectedMedicalHistory(medicalHistory);
                      setFormOpen(true);
                    }}
                  >
                    Update Medical History
                  </Button>
                  {medicalHistory.scanDocuments?.length > 0 && (
                    <Button
                      variant="default"
                      className="flex items-center gap-2"
                      onClick={() =>
                        handleDownloadScanDocuments(
                          medicalHistory.scanDocuments
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download Scans as ZIP
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2 mt-2"
                    onClick={() => {
                      setSelectedMedicalHistory(medicalHistory);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Delete Medical History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">
            No medical history available for the selected patient.
          </p>
        )}
      </div>
      <MedicalHistoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        history={selectedMedicalHistory}
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
                selectedMedicalHistory &&
                handleDeleteMedicalHistory(selectedMedicalHistory._id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
