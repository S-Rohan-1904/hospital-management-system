import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

import { jsPDF } from "jspdf";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { MedicalHistory } from "../models/medicalHistory.model.js";
import { ScanRequest } from "../models/scanRequest.model.js";
import { User } from "../models/user.model.js";
import { Hospital } from "../models/hospital.model.js";

const getScanDocumentsByMedicalHistory = async (
  patientId,
  doctorId,
  hospitalId,
  startDate,
  endDate
) => {
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
};

const createMedicalHistory = asyncHandler(async (req, res) => {
  const {
    patient,
    doctor,
    startDate,
    endDate,
    diagnosis,
    description,
  } = req.body;

  // if (
  //   !patient ||
  //   !doctor ||
  //   !hospital ||
  //   !startDate ||
  //   !endDate ||
  //   !diagnosis ||
  //   !description
  // ) {
  //   return res
  //     .status(400)
  //     .json(new ApiResponse(400, {}, "All required fields must be provided"));
  // }

  if (req.user?.role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const hospitalObject = await Hospital.findOne({ doctors: doctor })

  let scanDocuments, medicalHistory;
  try {
    scanDocuments = await getScanDocumentsByMedicalHistory(
      patient,
      doctor,
      hospitalObject._id,
      startDate,
      endDate
    );
  
    if (scanDocuments.length === 0) {
      return res
        .status(409)
        .json(new ApiResponse(409, {}, "No medical history found"));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Failed to fetch medical history"))
  }

  try {
    const checkMedicalHistoryExists = await MedicalHistory.findOne({
      startDate,
      endDate
    })
  
    if (checkMedicalHistoryExists) {
      return res
        .status(409)
        .json(new ApiResponse(409, {}, "Medical History already exists"))
    }
  
    medicalHistory = await MedicalHistory.create({
      patient,
      doctor,
      hospital: hospitalObject._id,
      startDate,
      endDate,
      scanDocuments,
      diagnosis,
      description,
    });
  
    if (!medicalHistory) {
      
    }
  } catch (error) {
    return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to create medical history"));
  }

  let uploadedPDF;

  for (const role of ["doctor","patient"]) {
    const formatDate = (date) => {
      const day = new Date(date).getDate();
      const month = new Date(date).toLocaleString("default", { month: "short" });
      const year = new Date(date).getFullYear();
      return `${day} ${month} ${year}`;
    };

    try {
      const medicalHistories = await MedicalHistory.aggregate([
        {
          $match:
            role === "doctor"
              ? { doctor: new mongoose.Types.ObjectId(req.user._id) }
              : { patient: new mongoose.Types.ObjectId(patient) },
        },
        {
          $lookup: {
            from: "users",
            localField: "patient",
            foreignField: "_id",
            as: "patientDetails",
          },
        },
        { $unwind: "$patientDetails" },
        {
          $lookup: {
            from: "users",
            localField: "doctor",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        { $unwind: "$doctorDetails" },
        {
          $lookup: {
            from: "hospitals",
            localField: "hospital",
            foreignField: "_id",
            as: "hospitalDetails",
          },
        },
        { $unwind: "$hospitalDetails" },
        {
          $project: {
            _id: 1,
            diagnosis: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            scanDocuments: 1,
            "patientDetails.fullName": 1,
            "doctorDetails.fullName": 1,
            "hospitalDetails.name": 1,
          },
        },
      ]);

      // Create a styled PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      let yOffset = 50;

      medicalHistories.forEach((history, index) => {
        if (index > 0) {
          pdf.addPage(); // Start each new medical history on a fresh page
          yOffset = 30; // Reset yOffset for the new page
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40; // Left margin
        const lineSpacing = 15; // Line spacing
        const contentWidth = pageWidth - 2 * margin;

        const addPageIfNeeded = (yOffset, additionalHeight) => {
          if (yOffset + additionalHeight > pageHeight - 30) {
            pdf.addPage();
            return 30; // Reset yOffset for the new page
          }
          return yOffset;
        };

        const wrapAndRenderText = (text, x, y) => {
          const wrappedText = pdf.splitTextToSize(text, contentWidth);
          wrappedText.forEach((line) => {
            y = addPageIfNeeded(y, lineSpacing);
            pdf.text(line, x, y);
            y += lineSpacing;
          });
          return y;
        };

        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(16);
        const title = "Medical History";
        const textWidth = pdf.getTextWidth(title);
        const centerX = (pageWidth - textWidth) / 2;
        pdf.text(title, centerX, yOffset); // Centered title
        yOffset += 40;

        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(12);

        pdf.text(
          `Patient Name: ${history.patientDetails.fullName}`,
          margin,
          yOffset
        );
        yOffset += 20;
        pdf.text(
          `Doctor Name: ${history.doctorDetails.fullName}`,
          margin,
          yOffset
        );
        yOffset += 20;
        pdf.text(
          `Hospital Name: ${history.hospitalDetails.name}`,
          margin,
          yOffset
        );
        yOffset += 20;

        // Use formatDateWithSuffix to display the date with suffix
        pdf.text(`Start Date: ${formatDate(history.startDate)}`, margin, yOffset);
        yOffset += 20;
        pdf.text(`End Date: ${formatDate(history.endDate)}`, margin, yOffset);
        yOffset += 20;

        // Diagnosis Section
        pdf.setFont("Helvetica", "bold");
        pdf.text(`Diagnosis:`, margin, yOffset);
        yOffset += 20;

        pdf.setFont("Helvetica", "normal");
        yOffset = wrapAndRenderText(history.diagnosis, margin + 20, yOffset);
        yOffset += 20; // Add spacing after diagnosis

        // Description Section
        pdf.setFont("Helvetica", "bold");
        pdf.text(`Description:`, margin, yOffset);
        yOffset += 20;

        pdf.setFont("Helvetica", "normal");
        yOffset = wrapAndRenderText(history.description, margin + 20, yOffset);
        yOffset += 20; // Add spacing after description

        // Scan Documents Section
        if (history.scanDocuments.length > 0) {
          pdf.setFont("Helvetica", "bold");
          pdf.text(`Scan Documents:`, margin, yOffset);
          yOffset += 20;

          pdf.setFont("Helvetica", "normal");
          history.scanDocuments.forEach((doc) => {
            yOffset = addPageIfNeeded(yOffset, lineSpacing);
            pdf.setTextColor(0, 0, 255);
            pdf.textWithLink(doc, margin + 20, yOffset, { url: doc });
            pdf.setTextColor(0, 0, 0);
            yOffset += lineSpacing;
          });
        }
      });

      const pdfBuffer = pdf.output("arraybuffer");

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const fileName = `medical-history-${MedicalHistory._id}.pdf`;
      const filePath = path.join(__dirname, "uploads", fileName);

      // Ensure the uploads directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

      uploadedPDF = await uploadToCloudinary(filePath);

    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            error.message || "Something went wrong while generating the PDF"
          )
        );
    }
  }

  try {
    for (const role in ["doctor","patient"]){
      if (role==="doctor") {
        const doctor = await User.findById(req.user._id);
        if (doctor.medicalHistoryUrl!==""){
          await deleteFromCloudinary(doctor.medicalHistoryUrl);
        }
        doctor.medicalHistoryUrl = uploadedPDF.url
        await doctor.save({validateBeforeSave: false})
      } else {
        const patientObject = await User.findById(patient);
        if (patientObject.medicalHistoryUrl!==""){
          await deleteFromCloudinary(patientObject.medicalHistoryUrl);
        }
        patientObject.medicalHistoryUrl = uploadedPDF.url
        await patientObject.save({validateBeforeSave: false})
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Failed to update Medical history Url"))
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

  if (!patientId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "patientId is required"));
  }

  if (!doctorId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "doctorId is required"));
  }

  if (!["doctor", "patient"].includes(req.user?.role)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  let filter = {};
  if (patientId) filter.patient = patientId;
  if (doctorId) filter.doctor = doctorId;

  const medicalHistories = await MedicalHistory.find(filter)
    .populate([
      {
        path: "patient",
        select: "-password -refreshToken",
      },
      {
        path: "doctor",
        select: "-password -refreshToken",
      },
      {
        path: "hospital",
      },
    ])
    .exec();

  if (!medicalHistories) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "No medical histories found"));
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
  const { type } = req.query;

  if (!["doctor", "patient"].includes(req.user?.role)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  let medicalHistory;

  if (type === "doctor") {
    medicalHistory = await MedicalHistory.find({ doctor: id })
      .populate([
        {
          path: "patient",
          select: "-password -refreshToken",
        },
        {
          path: "doctor",
          select: "-password -refreshToken",
        },
        {
          path: "hospital",
        },
      ])
      .exec();
  } else if (type === "patient") {
    medicalHistory = await MedicalHistory.find({ patient: id })
      .populate([
        {
          path: "patient",
          select: "-password -refreshToken",
        },
        {
          path: "doctor",
          select: "-password -refreshToken",
        },
        {
          path: "hospital",
        },
      ])
      .exec();
  }

  if (medicalHistory.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Medical history not found"));
  }

  return res.status(200).json(new ApiResponse(200, medicalHistory));
});

const updateMedicalHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user?.role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }
  const updateFields = {};

  for (const [key, value] of Object.entries(req.body)) {
    if (value !== undefined && value !== null) {
      updateFields[key] = value;
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "No fields to update provided"));
  }
  const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate(
    id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!updatedMedicalHistory) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Medical history not found"));
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
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const deletedMedicalHistory = await MedicalHistory.findByIdAndDelete(id);

  if (!deletedMedicalHistory) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Medical history not found"));
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

const getMedicalHistoryAsPDF = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({email}).select("medicalHistoryUrl");

      if (!user) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "User not found"))
      }
    
      return res
        .status(200)
        .json(new ApiResponse(200, user, "Medical History PDF has been successfully fetched"))
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          error.message || "Error fetching medical History url"
        )
      );
  }
});

export {
  createMedicalHistory,
  getMedicalHistories,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
  getMedicalHistoryAsPDF,
};
