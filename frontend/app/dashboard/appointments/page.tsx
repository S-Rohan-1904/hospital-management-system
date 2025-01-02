import { AppointmentsClient } from "./appointments-client";

const appointments = [
  {
    _id: "1",
    startTime: "2025-01-03T10:00:00.000Z",
    endTime: "2025-01-03T10:30:00.000Z",
    status: "scheduled",
    patient: {
      _id: "63f5f6d76c23ae001234abcd",
      fullName: "John Doe",
      email: "john.doe@example.com",
    },
    doctor: {
      _id: "63f5f6d76c23ae00abcd1234",
      fullName: "Dr. Jane Smith",
      email: "jane.smith@example.com",
      specialization: "Cardiology",
    },
    hospital: {
      _id: "63f5f6d76c23ae00dcba4321",
      name: "City Hospital",
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
      _id: "63f5f6d76c23ae009876abcd",
      fullName: "Dr. Michael Lee",
      email: "michael.lee@example.com",
      specialization: "Endocrinology",
    },
    hospital: {
      _id: "63f5f6d76c23ae0076543210",
      name: "Downtown Medical Center",
      address: "456 Broadway, New York, NY",
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
      _id: "63f5f6d76c23ae00dcba5678",
      fullName: "Dr. Emily Davis",
      email: "emily.davis@example.com",
      specialization: "Dermatology",
    },
    hospital: {
      _id: "63f5f6d76c23ae0032109876",
      name: "Westside Clinic",
      address: "789 Elm Street, Los Angeles, CA",
    },
  },
];

export default async function AppointmentsPage() {
  return <AppointmentsClient appointments={appointments} />;
}
