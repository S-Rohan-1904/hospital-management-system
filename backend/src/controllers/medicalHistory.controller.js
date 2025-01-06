import { MedicalHistory } from "../models/medicalHistory.model.js";
import { ScanRequest } from "../models/scanRequest.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.model.js";

const getScanDocumentsByMedicalHistory = async (
  patientId,
  doctorId,
  hospitalId,
  startDate,
  endDate
) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59);

    const scanRequests = await ScanRequest.find({
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId,
      dateOfUpload: { $gte: start, $lte: end },
      scanDocument: { $exists: true, $ne: null },
    });

    const scanDocuments = scanRequests.map((request) => request.scanDocument);

    return scanDocuments;
  } catch (error) {
    throw new ApiError(res, 500, error.message || "Error fetching scan documents");
  }
};

const createMedicalHistory = asyncHandler(async (req, res) => {
  const {
    patient,
    doctor,
    hospital,
    startDate,
    endDate,
    diagnosis,
    description,
  } = req.body;

  if (
    !patient ||
    !doctor ||
    !hospital ||
    !startDate ||
    !endDate ||
    !diagnosis ||
    !description
  ) {
    throw new ApiError(res, 400, "All required fields must be provided");
  }

  if (req.user?.role !== "doctor") {
    throw new ApiError(res, 403, "Forbidden request");
  }

  const scanDocuments = await getScanDocumentsByMedicalHistory(
    patient,
    doctor,
    hospital,
    startDate,
    endDate
  );

  if (!scanDocuments) {
    throw new ApiError(res, 500, "Error fetching scan documents");
  }

  const medicalHistory = await MedicalHistory.create({
    patient,
    doctor,
    hospital,
    startDate,
    endDate,
    scanDocuments,
    diagnosis,
    description,
  });

  if (!medicalHistory) {
    throw new ApiError(res, 500, "Failed to create medical history");
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
  const { patientId, doctorId } = req.body;

  if (req.user?.role !== "doctor") {
    throw new ApiError(res, 403, "Forbidden request");
  }

  let filter = {};
  if (patientId) filter.patient = patientId;
  if (doctorId) filter.doctor = doctorId;

  const medicalHistories = await MedicalHistory.find(filter)
    .populate("patient doctor hospital")
    .exec();

  if (!medicalHistories) {
    throw new ApiError(res, 404, "No medical histories found");
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
    throw new ApiError(res, 403, "Forbidden request");
  }
  const medicalHistory = await MedicalHistory.findById(id)
    .populate("patient doctor hospital")
    .exec();

  if (!medicalHistory) {
    throw new ApiError(res, 404, "Medical history not found");
  }

  return res.status(200).json(new ApiResponse(200, medicalHistory));
});

const updateMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user?.role !== "doctor") {
    throw new ApiError(res, 403, "Forbidden request");
  }
  const updateFields = {};

  for (const [key, value] of Object.entries(req.body)) {
    if (value !== undefined && value !== null) {
      updateFields[key] = value;
    }
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(res, 400, "No fields to update provided");
  }
  const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate(
    id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!updatedMedicalHistory) {
    throw new ApiError(res, 404, "Medical history not found");
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
    throw new ApiError(res, 403, "Forbidden request");
  }

  const deletedMedicalHistory = await MedicalHistory.findByIdAndDelete(id);

  if (!deletedMedicalHistory) {
    throw new ApiError(res, 404, "Medical history not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedMedicalHistory,
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
