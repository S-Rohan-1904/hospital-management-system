import { z } from "zod";

const createMedicalHistorySchema = z
  .object({
    patient: z
      .string()
      .min(1, "description cannot be empty")
      .refine((value) => value.trim().length > 0, {
        message: "patient cannot be empty after trimming whitespace",
      }),
    doctor: z
      .string()
      .min(1, "description cannot be empty")
      .refine((value) => value.trim().length > 0, {
        message: "doctor cannot be empty after trimming whitespace",
      }),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    diagnosis: z
      .string()
      .min(1, "description cannot be empty")
      .refine((value) => value.trim().length > 0, {
        message: "diagnosis cannot be empty after trimming whitespace",
      }),
    description: z
      .string()
      .min(1, "description cannot be empty")
      .refine((value) => value.trim().length > 0, {
        message: "description cannot be empty after trimming whitespace",
      }),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "startDate must be before endDate",
      path: ["startDate"],
    }
  );

const updateMedicalHistorySchema = z.object({
  patient: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "patient cannot be empty after trimming whitespace",
    }),
  doctor: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "doctor cannot be empty after trimming whitespace",
    }),
  hospital: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "hospital cannot be empty after trimming whitespace",
    }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  scanDocuments: z.array(z.string()).optional(),
  diagnosis: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "diagnosis cannot be empty after trimming whitespace",
    }),
  description: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "description cannot be empty after trimming whitespace",
    }),
});

const getMedicalHistorySchema = z.object({
  patientId: z
    .string()
    .min(1, "description cannot be empty")
    .refine((value) => value.trim().length > 0, {
      message: "description cannot be empty after trimming whitespace",
    }),
  doctorId: z
    .string()
    .min(1, "description cannot be empty")
    .refine((value) => value.trim().length > 0, {
      message: "description cannot be empty after trimming whitespace",
    }),
});

export {
  createMedicalHistorySchema,
  updateMedicalHistorySchema,
  getMedicalHistorySchema,
};
