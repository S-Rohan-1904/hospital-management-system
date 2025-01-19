import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ScanRequest } from "../models/scanRequest.model.js";
import { Appointment } from "../models/appointment.model.js";
import { User } from "../models/user.model.js";

const createScanRequest = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }
  const { scanCentre, description, appointment } = req.body;

  // if (
  //   [scanCentre, description, appointment].some(
  //     (field) => !field || field.trim() == ""
  //   )
  // ) {
  //   return res
  //     .status(400)
  //     .json(new ApiResponse(400, {}, "All fields are required"));
  // }

  const checkScanRequestExists = await ScanRequest.findOne({
    appointment: appointment,
  });

  if (!checkScanRequestExists) {
    const appointmentObject = await Appointment.findById(appointment);

    if (!appointmentObject) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Invalid Appointment"));
    }

    const scanRequest = await ScanRequest.create({
      patient: appointmentObject.patient,
      doctor: req.user._id,
      scanCentre,
      hospital: appointmentObject.hospital,
      description,
      appointment: appointmentObject._id,
    });

    if (!scanRequest) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to create scan request"));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, scanRequest, "Scan request created"));
  } else {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          {},
          "Scan Request for this appointment already exists."
        )
      );
  }
});

const deleteScanRequest = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const scanRequestId = req.params?.id;

  if (!scanRequestId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Scan request id is required"));
  }

  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Scan request not found"));
  }

  if (["pending", "rejected"].includes(scanRequest.status)) {
    if (!scanRequest.doctor.equals(req.user._id)) {
      return res
        .status(403)
        .json(new ApiResponse(403, {}, "Forbidden request"));
    }

    await ScanRequest.deleteOne({ _id: scanRequest._id });

    return res
      .status(200)
      .json(new ApiResponse(200, scanRequest, "Scan request deleted"));
  } else {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Scan request cannot be deleted"));
  }
});

const approveOrRejectScanRequest = asyncHandler(async (req, res) => {
  if (req.user?.role !== "scanCentre") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const { id: scanRequestId, status } = req.params;

  if (!scanRequestId && !status) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Scan request id and status is required"));
  }

  if (status && status !== "accepted" && status !== "rejected") {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Status can only be accepted or rejected")
      );
  }

  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Scan request not found"));
  }

  if (!scanRequest.scanCentre.equals(req.user._id)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  if (scanRequest.status !== "pending") {
    return res
      .status(409)
      .json(
        new ApiResponse(409, {}, `Scan request already ${scanRequest.status}`)
      );
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
    matchCondition.doctor = userId;
  } else if (role === "patient") {
    matchCondition.patient = userId;
  } else if (role === "scanCentre") {
    matchCondition.scanCentre = userId;
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

    {
      $project: {
        "patient.password": 0, // Exclude password from patient
        "doctor.password": 0, // Exclude password from doctor
        "scanCentre.password": 0, // Exclude password from scanCentre
        "hospital.doctors": 0, // Exclude password from hospital
        "appointment.details": 0, // Exclude appointment details
        "patient.refreshToken": 0,
        "doctor.refreshToken": 0,
        "scanCentre.refreshToken": 0,
      },
    },
    // Optional: Add computed fields if needed
    {
      $addFields: {
        isCompleted: { $eq: ["$status", "completed"] },
        createdAt: "$createdAt", // Include createdAt if present
        updatedAt: "$updatedAt",
      },
    },

    // Sort by most recent first
    { $sort: { date: -1 } },
  ]);

  return scanRequests;
};

//Scan Requests by a particular doctor or scan centre or patient
const getScanRequests = asyncHandler(async (req, res) => {
  const { _id: userId, role } = req.user;

  const scanRequests = await getScanRequestsByRole(userId, role);

  res
    .status(200)
    .json(new ApiResponse(200, scanRequests, "Scan requests fetched"));
});

const completeScanRequest = asyncHandler(async (req, res) => {
  const { role } = req.user;

  if (role !== "scanCentre") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const scanRequestId = req.params?.id;

  if (!scanRequestId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Scan request id is required"));
  }

  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Scan request not found"));
  }

  if (!scanRequest.scanCentre.equals(req.user._id)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  if (scanRequest.status !== "accepted") {
    return res
      .status(409)
      .json(
        new ApiResponse(409, {}, `Scan request already ${scanRequest.status}`)
      );
  }

  const scanDocumentLocalPath = req.file?.path;

  if (!scanDocumentLocalPath && !scanRequest.scanDocument) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Scan document is required"));
  }

  if (scanDocumentLocalPath) {
    const fileExtension = scanDocumentLocalPath.split(".").pop().toLowerCase();
    if (fileExtension !== "pdf") {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Only PDF files are allowed"));
    }
    const scanDocument = await uploadToCloudinary(scanDocumentLocalPath);

    if (!scanDocument) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Error uploading scan document"));
    }

    console.log(scanDocument.url);
    scanRequest.scanDocument = scanDocument.url;
  }

  scanRequest.status = "completed";
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
  const scanRequestId = req.params?.id;

  const scanRequest = await ScanRequest.findById(scanRequestId);

  if (!scanRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Scan request not found"));
  }

  if (role === "doctor") {
    const { description, scanCentre } = req.body;

    if (!description && !scanCentre) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, "description or scanCentre is required")
        );
    }
    if (description) {
      scanRequest.description = description;
    }

    if (scanCentre) {
      scanRequest.scanCentre = scanCentre;
    }
  } else if (role === "scanCentre") {
    const updatedScanDocumentLocalPath = req.file?.path;

    if (!updatedScanDocumentLocalPath) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Scan document is required"));
    }

    const fileExtension = updatedScanDocumentLocalPath
      .split(".")
      .pop()
      .toLowerCase();
    if (fileExtension !== "pdf") {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Only PDF files are allowed"));
    }

    const updatedScanDocument = await uploadToCloudinary(
      updatedScanDocumentLocalPath
    );

    if (!updatedScanDocument) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Error uploading scan document"));
    }

    const oldScanDocument = scanRequest.scanDocument;

    console.log(updatedScanDocument);

    scanRequest.scanDocument = updatedScanDocument.url;

    if (oldScanDocument) {
      await deleteFromCloudinary(oldScanDocument);
    }
  } else {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
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

const getAllScancentres = asyncHandler(async (req, res) => {
  try {
    const scanCentres = await User.find({ role: "scanCentre" }).select(
      "-password -refreshToken"
    );

    if (!scanCentres) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No ScanCentres found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          scanCentres,
          "ScanCentres have been successfully fetched."
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Unable to fetch ScanCentres."));
  }
});

export {
  createScanRequest,
  deleteScanRequest,
  approveOrRejectScanRequest,
  getScanRequests,
  completeScanRequest,
  updateScanRequest,
  getAllScancentres,
};
