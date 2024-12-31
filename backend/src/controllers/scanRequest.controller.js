import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ScanRequest } from "../models/scanRequest.model.js";

const createScanRequest = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }
  const { patient, scanCenter, hospital, description, appointment } = req.body;

  if (
    [patient, scanCenter, hospital, description, appointment].some(
      (field) => !field || field.trim() == ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const scanRequest = await ScanRequest.create({
    patient,
    doctor: req.user._id,
    scanCenter,
    hospital,
    description,
    appointment,
  });

  if (!scanRequest) {
    throw new ApiError(500, "Failed to create scan request");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, scanRequest, "Scan request created"));
});

const deleteScanRequest = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  const scanRequestId = req.params?.id;

  if (!scanRequestId) {
    throw new ApiError(400, "Scan request id is required");
  }

  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    throw new ApiError(404, "Scan request not found");
  }

  if (scanRequest.doctor !== req.user._id) {
    throw new ApiError(403, "Forbidden request");
  }

  await scanRequest.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, scanRequest, "Scan request deleted"));
});

const approveOrRejectScanRequest = asyncHandler(async (req, res) => {
  if (req.user?.role !== "scanCentre") {
    throw new ApiError(403, "Forbidden request");
  }

  const { id: scanRequestId, status } = req.params;

  if (!scanRequestId && !status) {
    throw new ApiError(400, "Scan request id and status is required");
  }

  if (status && status !== "approved" && status !== "rejected") {
    throw new ApiError(400, "Status can only be approved or rejected");
  }

  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    throw new ApiError(404, "Scan request not found");
  }

  if (scanRequest.scanCenter !== req.user._id) {
    throw new ApiError(403, "Forbidden request");
  }

  if (scanRequest.status !== "pending") {
    throw new ApiError(409, `Scan request already ${scanRequest.status}`);
  }

  scanRequest.status = status;
  await scanRequest.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, scanRequest, `Scan request ${status}`));
});

const getScanRequestsByRole = async (userId, role) => {
  const matchCondition = {};

  // Match condition based on role
  if (role === "doctor") {
    matchCondition.doctor = mongoose.Types.ObjectId(userId);
  } else if (role === "patient") {
    matchCondition.patient = mongoose.Types.ObjectId(userId);
  } else if (role === "scanCentre") {
    matchCondition.scanCentre = mongoose.Types.ObjectId(userId);
  } else {
    throw new Error("Invalid role");
  }

  const scanRequests = await ScanRequest.aggregate([
    // Match requests based on role
    { $match: matchCondition },

    // Extend data by populating references
    {
      $lookup: {
        from: "users", // Populate patient data
        localField: "patient",
        foreignField: "_id",
        as: "patient",
      },
    },
    {
      $lookup: {
        from: "users", // Populate doctor data
        localField: "doctor",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $lookup: {
        from: "users", // Populate scanCentre data
        localField: "scanCentre",
        foreignField: "_id",
        as: "scanCentre",
      },
    },
    {
      $lookup: {
        from: "hospitals", // Populate hospital data
        localField: "hospital",
        foreignField: "_id",
        as: "hospital",
      },
    },
    {
      $lookup: {
        from: "appointments", // Populate appointment data
        localField: "appointment",
        foreignField: "_id",
        as: "appointment",
      },
    },

    // Unwind arrays to simplify the structure
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$scanCentre", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$appointment", preserveNullAndEmptyArrays: true } },

    // Optional: Add computed fields if needed
    {
      $addFields: {
        isCompleted: { $eq: ["$status", "completed"] },
      },
    },

    // Sort by most recent first
    { $sort: { date: -1 } },
  ]);

  return scanRequests;
};

//Scan Requests by a particular doctor or scan centre or patient
const getScanRequestsById = asyncHandler(async (req, res) => {
  const { _id: userId, role } = req.user;

  const scanRequests = await getScanRequestsByRole(userId, role);

  res
    .status(200)
    .json(new ApiResponse(200, scanRequests, "Scan requests fetched"));
});

const completeScanRequest = asyncHandler(async (req, res) => {
  const { role } = req.user;

  if (role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  const scanRequestId = req.params?.id;

  if (!scanRequestId) {
    throw new ApiError(400, "Scan request id is required");
  }

  if (scanRequestId !== req.user._id) {
    throw new ApiError(403, "Forbidden request");
  }
  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    throw new ApiError(404, "Scan request not found");
  }

  if (scanRequest.status !== "pending") {
    throw new ApiError(409, `Scan request already ${scanRequest.status}`);
  }

  const scanDocumentLocalPath = req.file?.path;

  if (!scanDocumentLocalPath) {
    throw new ApiError(400, "Scan document is required");
  }

  const scanDocument = await uploadToCloudinary(scanDocumentLocalPath);

  if (!scanDocument) {
    throw new ApiError(500, "Error uploading scan document");
  }

  scanRequest.status = "completed";
  scanRequest.scanDocument = scanDocument.url;
  scanRequest.dateOfUpload = Date.now();
  await scanRequest.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, scanRequest, "Scan request completed successfully")
    );
});

const updateScanRequest = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { description } = req.body;

  const updatedScanDocumentLocalPath = req.file?.path;

  if (!updatedScanDocumentLocalPath) {
    throw new ApiError(400, "Scan document is required");
  }

  const updatedScanDocument = await uploadToCloudinary(
    updatedScanDocumentLocalPath
  );

  if (!updatedScanDocument) {
    throw new ApiError(500, "Error uploading scan document");
  }

  const scanRequest = await ScanRequest.findById(req.user?.id);

  if (!scanRequest) {
    throw new ApiError(404, "Scan request not found");
  }

  if (role === "doctor") {
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }
    scanRequest.description = description;
  } else if (role === "scanCentre") {
    const scanDocumentLocalPath = req.file?.path;

    if (!scanDocumentLocalPath) {
      throw new ApiError(400, "Scan document is required");
    }

    const oldScanDocument = scanRequest.scanDocument;
    const scanDocument = await uploadToCloudinary(scanDocumentLocalPath);

    if (!scanDocument) {
      throw new ApiError(400, "Document URL is required");
    }

    scanRequest.scanDocument = scanDocument;
    scanRequest.status = "completed";

    if (oldScanDocument) {
      await deleteFromCloudinary(oldScanDocument);
    }
  } else {
    throw new ApiError(403, "Forbidden request");
  }

  const updatedScanRequest = await scanRequest.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedScanRequest,
        "Scan request updated successfully"
      )
    );
});

export {
  createScanRequest,
  deleteScanRequest,
  approveOrRejectScanRequest,
  getScanRequestsById,
  completeScanRequest,
  updateScanRequest,
};
