import { z } from "zod";

const requestAppointmentSchema = z
  .object({
    doctorId: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    hospitalId: z.string(),
    onlineAppointment: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: "startTime must be before endTime",
      path: ["startTime"],
    }
  );

const updateAppointmentSchema = z
  .object({
    doctorId: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    hospitalId: z.string().optional(),
    onlineAppointment: z.boolean().optional(),
    description: z
      .string()
      .max(500, { message: "Description must be 500 characters or fewer" })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: "startTime must be before endTime",
      path: ["startTime"],
    }
  );

const rescheduleAppointmentSchema = z
  .object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: "startTime must be before endTime",
      path: ["startTime"],
    }
  );

export {
  requestAppointmentSchema,
  updateAppointmentSchema,
  rescheduleAppointmentSchema,
};
