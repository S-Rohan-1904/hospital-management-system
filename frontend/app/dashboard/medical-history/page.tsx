import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
const medicalHistory = [
  {
    _id: "63f1c8e8e37a2b1d6c0b13f1",
    patient: {
      _id: "63f1c8e8e37a2b1d6c0b1234",
      username: "john_doe",
      email: "john@example.com",
      fullName: "John Doe",
      avatar: "https://example.com/avatar/john.jpg",
      address: "123 Street, City",
      role: "patient",
      gender: "male",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    doctor: {
      _id: "63f1c8e8e37a2b1d6c0b5678",
      username: "dr_smith",
      email: "smith@example.com",
      fullName: "Dr. Smith",
      avatar: "https://example.com/avatar/smith.jpg",
      address: "456 Avenue, City",
      role: "doctor",
      gender: "male",
      specialization: "Cardiology",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    hospital: {
      _id: "63f1c8e8e37a2b1d6c0b9101",
      name: "City Hospital",
      address: "789 Boulevard, City",
      contact: "123-456-7890",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    },
    startDate: "2025-01-01T00:00:00.000Z",
    endDate: "2025-01-10T00:00:00.000Z",
    scanDocuments: [
      "https://example.com/documents/scan1.pdf",
      "https://example.com/documents/scan2.pdf",
    ],
    diagnosis: "Hypertension",
    description:
      "Patient experienced high blood pressure and related symptoms.",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    _id: "63f1c8e8e37a2b1d6c0b13f2",
    patient: {
      _id: "63f1c8e8e37a2b1d6c0b2345",
      username: "jane_doe",
      email: "jane@example.com",
      fullName: "Jane Doe",
      avatar: "https://example.com/avatar/jane.jpg",
      address: "321 Road, City",
      role: "patient",
      gender: "female",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    doctor: {
      _id: "63f1c8e8e37a2b1d6c0b6789",
      username: "dr_jones",
      email: "jones@example.com",
      fullName: "Dr. Jones",
      avatar: "https://example.com/avatar/jones.jpg",
      address: "654 Street, City",
      role: "doctor",
      gender: "female",
      specialization: "Dermatology",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    hospital: {
      _id: "63f1c8e8e37a2b1d6c0b9102",
      name: "HealthCare Hospital",
      address: "890 Circle, City",
      contact: "987-654-3210",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    },
    startDate: "2025-01-11T00:00:00.000Z",
    endDate: "2025-01-15T00:00:00.000Z",
    scanDocuments: ["https://example.com/documents/scan3.pdf"],
    diagnosis: "Eczema",
    description: "Patient treated for skin irritation and redness.",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    _id: "63f1c8e8e37a2b1d6c0b13f9",
    patient: {
      _id: "63f1c8e8e37a2b1d6c0b2345",
      username: "jane_doe",
      email: "jane@example.com",
      fullName: "Jane Doe",
      avatar: "https://example.com/avatar/jane.jpg",
      address: "321 Road, City",
      role: "patient",
      gender: "female",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    doctor: {
      _id: "63f1c8e8e37a2b1d6c0b6789",
      username: "dr_jones",
      email: "jones@example.com",
      fullName: "Dr. Jones",
      avatar: "https://example.com/avatar/jones.jpg",
      address: "654 Street, City",
      role: "doctor",
      gender: "female",
      specialization: "Dermatology",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    hospital: {
      _id: "63f1c8e8e37a2b1d6c0b9102",
      name: "HealthCare Hospital",
      address: "890 Circle, City",
      contact: "987-654-3210",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    },
    startDate: "2025-01-11T00:00:00.000Z",
    endDate: "2025-01-15T00:00:00.000Z",
    scanDocuments: ["https://example.com/documents/scan3.pdf"],
    diagnosis: "Eczema",
    description: "Patient treated for skin irritation and redness.",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    _id: "63f1c8e8e37a2b1d6c0b13f8",
    patient: {
      _id: "63f1c8e8e37a2b1d6c0b2345",
      username: "jane_doe",
      email: "jane@example.com",
      fullName: "Jane Doe",
      avatar: "https://example.com/avatar/jane.jpg",
      address: "321 Road, City",
      role: "patient",
      gender: "female",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    doctor: {
      _id: "63f1c8e8e37a2b1d6c0b6789",
      username: "dr_jones",
      email: "jones@example.com",
      fullName: "Dr. Jones",
      avatar: "https://example.com/avatar/jones.jpg",
      address: "654 Street, City",
      role: "doctor",
      gender: "female",
      specialization: "Dermatology",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    hospital: {
      _id: "63f1c8e8e37a2b1d6c0b9102",
      name: "HealthCare Hospital",
      address: "890 Circle, City",
      contact: "987-654-3210",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    },
    startDate: "2025-01-11T00:00:00.000Z",
    endDate: "2025-01-15T00:00:00.000Z",
    scanDocuments: ["https://example.com/documents/scan3.pdf"],
    diagnosis: "Eczema",
    description: "Patient treated for skin irritation and redness.",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  {
    _id: "63f1c8e8e37a2b1d6c0b13f5",
    patient: {
      _id: "63f1c8e8e37a2b1d6c0b2345",
      username: "jane_doe",
      email: "jane@example.com",
      fullName: "Jane Doe",
      avatar: "https://example.com/avatar/jane.jpg",
      address: "321 Road, City",
      role: "patient",
      gender: "female",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    doctor: {
      _id: "63f1c8e8e37a2b1d6c0b6789",
      username: "dr_jones",
      email: "jones@example.com",
      fullName: "Dr. Jones",
      avatar: "https://example.com/avatar/jones.jpg",
      address: "654 Street, City",
      role: "doctor",
      gender: "female",
      specialization: "Dermatology",
      createdAt: "2025-01-01T12:00:00.000Z",
      updatedAt: "2025-01-01T12:00:00.000Z",
    },
    hospital: {
      _id: "63f1c8e8e37a2b1d6c0b9102",
      name: "HealthCare Hospital",
      address: "890 Circle, City",
      contact: "987-654-3210",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    },
    startDate: "2025-01-11T00:00:00.000Z",
    endDate: "2025-01-15T00:00:00.000Z",
    scanDocuments: ["https://example.com/documents/scan3.pdf"],
    diagnosis: "Eczema",
    description: "Patient treated for skin irritation and redness.",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
];

export default async function MedicalHistoryPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medical History</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {medicalHistory.map((record) => (
          <Card key={record._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {record.diagnosis}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 ">
                <div className="flex items-center gap-2 flex-row">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(record.startDate), "P")}
                  </div>
                  {" - "}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(record.endDate), "P")}
                  </div>
                </div>

                <p className="text-sm">{record.description}</p>
                {record.diagnosis && (
                  <div className="pt-2">
                    <strong className="text-sm">Diagnosis:</strong>
                    <p className="text-sm text-muted-foreground">
                      {record.diagnosis}
                    </p>
                  </div>
                )}
                {record.description && (
                  <div className="pt-2">
                    <strong className="text-sm">Description:</strong>
                    <p className="text-sm text-muted-foreground">
                      {record.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
