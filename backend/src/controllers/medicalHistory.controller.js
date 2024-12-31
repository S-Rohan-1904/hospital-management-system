import { MedicalHistory } from "../models/medicalHistory.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a new medical history record
const createMedicalHistory = asyncHandler(async (req, res) => {
  const {
    patient,
    doctor,
    hospital,
    startTime,
    endTime,
    scanDocument,
    diagnosis,
    description,
  } = req.body;

  if (
    !patient ||
    !doctor ||
    !hospital ||
    !startTime ||
    !endTime ||
    !diagnosis ||
    !description
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  const medicalHistory = await MedicalHistory.create({
    patient,
    doctor,
    hospital,
    startTime,
    endTime,
    scanDocument,
    diagnosis,
    description,
  });

  if (!MedicalHistory) {
    throw new ApiError(500, "Failed to create medical history");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        medicalHistory,
        "Medical history created successfully"
      )
    );
});

const getMedicalHistories = asyncHandler(async (req, res) => {
  const { patientId, doctorId } = req.params;

  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  let filter = {};
  if (patientId) filter.patient = patientId;
  if (doctorId) filter.doctor = doctorId;

  const medicalHistories = await MedicalHistory.find(filter)
    .populate("patient doctor hospital")
    .exec();

  if (!medicalHistories) {
    throw new ApiError(404, "No medical histories found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        medicalHistories,
        "Fetched Medical History successfully"
      )
    );
});

const getMedicalHistoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }
  const medicalHistory = await MedicalHistory.findById(id)
    .populate("patient doctor hospital")
    .exec();

  if (!medicalHistory) {
    throw new ApiError(404, "Medical history not found");
  }

  return res.status(200).json(new ApiResponse(200, medicalHistory));
});
const updateMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }
  const updateFields = {};

  for (const [key, value] of Object.entries(req.body)) {
    if (value !== undefined && value !== null) {
      updateFields[key] = value;
    }
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields to update provided");
  }
  const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate(
    id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!updatedMedicalHistory) {
    throw new ApiError(404, "Medical history not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMedicalHistory,
        "Medical history updated successfully"
      )
    );
});

const deleteMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  const deletedMedicalHistory = await MedicalHistory.findByIdAndDelete(id);

  if (!deletedMedicalHistory) {
    throw new ApiError(404, "Medical history not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deleteMedicalHistory,
        "Medical history deleted successfully"
      )
    );
});

export {
  createMedicalHistory,
  getMedicalHistories,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
};
