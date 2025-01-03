import { useAppointmentsContext } from "@/context/AppointmentsContext";

export const useAppointments = (id: string) => {
  const { appointments, updateAppointment, deleteAppointment, loading, error } =
    useAppointmentsContext();

  const appointment = appointments.find((appt) => appt._id === id);

  const update = (updatedData: Partial<typeof appointment>) => {
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    return updateAppointment(id, updatedData);
  };

  const remove = () => {
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    return deleteAppointment(id);
  };

  return { appointment, update, remove, loading, error };
};
