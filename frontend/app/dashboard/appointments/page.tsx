import { AppointmentsClient } from "./appointments-client";

const appointments = [
  {
    _id: "1",
    startTime: "2025-01-03T10:00:00.000Z",
    endTime: "2025-01-03T10:40:00.000Z",
    status: "scheduled",
    patient: {
      _id: "63f5f6d76c23ae001234abcd",
      fullName: "John Doe",
      email: "john.doe@example.com",
    },
    doctor: {
      _id: "doctor1",
      fullName: "Dr. Jane Smith",
      email: "jane.smith@example.com",
      specialization: "Cardiology",
    },
    hospital: {
      _id: "hospital1",
      name: "City General Hospital",
      address: "123 Main Street, New York, NY",
    },
  },
  {
    _id: "2",
    startTime: "2025-01-04T14:00:00.000Z",
    endTime: "2025-01-04T14:45:00.000Z",
    status: "rescheduled",
    patient: {
      _id: "63f5f6d76c23ae00abcd5678",
      fullName: "Alice Johnson",
      email: "alice.johnson@example.com",
    },
    doctor: {
      _id: "doctor3",
      fullName: "Dr. Emily Davis",
      email: "emily.davis@example.com",
      specialization: "Pediatrics",
    },
    hospital: {
      _id: "hospital1",
      name: "City General Hospital",
      address: "123 Main Street, New York, NY",
    },
  },
  {
    _id: "3",
    startTime: "2025-01-05T09:30:00.000Z",
    endTime: "2025-01-05T10:00:00.000Z",
    status: "pending",
    patient: {
      _id: "63f5f6d76c23ae00abcd9876",
      fullName: "Robert Brown",
      email: "robert.brown@example.com",
    },
    doctor: {
      _id: "doctor5",
      fullName: "Dr. Sarah Johnson",
      email: "sarah.johnson@example.com",
      specialization: "Orthopedics",
    },
    hospital: {
      _id: "hospital2",
      name: "Sunnydale Medical Center",
      address: "456 Sunny Ave, Sunnydale, CA",
    },
  },
  {
    _id: "4",
    startTime: "2025-01-06T12:00:00.000Z",
    endTime: "2025-01-06T12:30:00.000Z",
    status: "confirmed",
    patient: {
      _id: "63f5f6d76c23ae00abcd5432",
      fullName: "Emily White",
      email: "emily.white@example.com",
    },
    doctor: {
      _id: "doctor6",
      fullName: "Dr. Michael Brown",
      email: "michael.brown@example.com",
      specialization: "Neurology",
    },
    hospital: {
      _id: "hospital3",
      name: "Green Valley Hospital",
      address: "789 Green Rd, Green Valley, IL",
    },
  },
];

export default async function AppointmentsPage() {
  return <AppointmentsClient appointments={appointments} />;
}
