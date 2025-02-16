import asyncHandler from "../utils/asyncHandler.js";
import { Appointment } from "../models/appointment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.model.js";
import mongoose from "mongoose";
import { createRazorpayOrder } from "./paymentgateway.controller.js";

const isDoctorFree = async (doctorId, startTime, endTime) => {
  const overlappingAppointments = await Appointment.find({
    doctor: doctorId,
    status: { $in: ["scheduled", "rescheduled"] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      { startTime: { $lt: startTime }, endTime: { $gt: startTime } },
    ],
  });

  if (overlappingAppointments.length > 0) {
    return false;
  }

  return true;
};
const requestAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "patient") {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  const { doctorId, startTime, endTime, hospitalId, onlineAppointment } =
    req.body;

  // if (
  //   [doctorId, startTime, endTime, hospitalId].some(
  //     (field) => !field || field.trim() == ""
  //   )
  // ) {
  //   return res
  //     .status(400)
  //     .json(new ApiResponse(400, {}, "All fields are required"));
  // }

  const isDoctorFreeBoolean = await isDoctorFree(doctorId, startTime, endTime);

  if (!isDoctorFreeBoolean) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Doctor is not free at this time"));
  }

  const formattedStartTime = (new Date(startTime)).toISOString().replace("Z", "+00:00");
  const formattedEndTime = (new Date(endTime)).toISOString().replace("Z", "+00:00");

  const appointment = await Appointment.create({
    patient: req.user?._id,
    doctor: doctorId,
    hospital: hospitalId,
    startTime: formattedStartTime,
    endTime: formattedEndTime,
    status: "pending",
    onlineAppointment,
  });

  if (!appointment) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to request appointment"));
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, appointment, "Appointment request sent successfully")
    );
});

const approveOrRejectAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const { id: appointmentId, status } = req.params;

  if (!appointmentId || !status) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Appointment id and status are required"));
  }

  if (!(status === "scheduled" || status === "rejected")) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Status can only be approved or rejected")
      );
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Appointment not found"));
  }

  if (!appointment.doctor.equals(req.user._id)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  if (appointment.status !== "pending") {
    return res
      .status(409)
      .json(
        new ApiResponse(409, {}, `Appointment already ${appointment.status}`)
      );
  }

  if (status === "rejected") {
    appointment.status = status;
    await appointment.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, appointment, `Appointment ${status}`));
  }

  if (
    await isDoctorFree(
      appointment.doctor,
      appointment.startTime,
      appointment.endTime
    )
  ) {
    appointment.status = appointment.onlineAppointment ? "payment pending" : status;
    if (appointment.onlineAppointment){
      const order = await createRazorpayOrder(50000, "appointment", appointment._id);
      console.log(order.order_id);
      
      appointment.paymentId = order._id;
    }
    await appointment.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, appointment, `Appointment ${status}`));
  } else {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Doctor is not free at this time"));
  }
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }
  const { startTime, endTime } = req.body;

  if (!startTime && !endTime) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required"));
  }

  const appointmentId = req.params?.id;

  if (!appointmentId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Appointment id is required"));
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Appointment not found"));
  }

  if (!appointment.doctor.equals(req.user._id)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  if (appointment.status !== "scheduled") {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Appointment has to be scheduled first"));
  }

  if (!(await isDoctorFree(req.user._id, startTime, endTime))) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Doctor is not free at this time"));
  }
  appointment.status = "rescheduled";
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  await appointment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment has been rescheduled successfully"
      )
    );
});

const getAppointmentsById = asyncHandler(async (req, res) => {
  const { _id, role } = req.user;
  const userId = _id;

  if (role !== "patient" && role !== "doctor") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const pipeline = [
    {
      $match: role === "doctor" ? { doctor: userId } : { patient: userId },
    },
    {
      $lookup: {
        from: "users",
        localField: "patient",
        foreignField: "_id",
        as: "patientDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doctor",
        foreignField: "_id",
        as: "doctorDetails",
      },
    },
    {
      $lookup: {
        from: "hospitals",
        localField: "hospital",
        foreignField: "_id",
        as: "hospitalDetails",
      },
    },
    {
      $lookup: {
        from: "scanrequests",
        localField: "_id",
        foreignField: "appointment",
        as: "scanRequestDetails",
      },
    },
    {
      $lookup: {
        from: "payments",
        localField: "paymentId",
        foreignField: "_id",
        as: "paymentDetails",
      },
    },
    {
      $unwind: "$patientDetails",
    },
    {
      $unwind: "$doctorDetails",
    },
    {
      $unwind: {
        path: "$hospitalDetails",
        preserveNullAndEmptyArrays: true, // If no hospital details exist, retain the document
      },
    },
    {
      $addFields: {
        hasScanRequest: {
          $cond: {
            if: { $gt: [{ $size: "$scanRequestDetails" }, 0] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        description: 1,
        onlineAppointment: 1,
        meetingId: 1,
        hasScanRequest: 1,
        scanRequest: { $arrayElemAt: ["$scanRequestDetails", 0] },
        patient: {
          _id: "$patientDetails._id",
          fullName: "$patientDetails.fullName",
          email: "$patientDetails.email",
        },
        doctor: {
          _id: "$doctorDetails._id",
          fullName: "$doctorDetails.fullName",
          email: "$doctorDetails.email",
          specialization: "$doctorDetails.specialization",
        },
        hospital: {
          _id: "$hospitalDetails._id",
          name: "$hospitalDetails.name",
          address: "$hospitalDetails.address",
        },
        payment: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$onlineAppointment", true] },
                { $ne: ["$status", "paid"] },
              ],
            },
            then: { orderId: { $arrayElemAt: ["$paymentDetails.order_id", 0] } },
            else: null,
          },
        },
      },
    },
  ];
  
  const appointments = await Appointment.aggregate(pipeline);
  

  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Appointments fetched"));
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { id: appointmentId } = req.params;
  const { role } = req.user;

  if (!appointmentId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Appointment id is required"));
  }

  //only doctor should be able to add description
  if (role === "doctor") {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Appointment not found"));
    }

    const updateFields = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (value !== "") {
        updateFields[key] = value;
      }
    }

    if ("startTime" in updateFields && "endTime" in updateFields) {
      const updatedStartTimeUTC = new Date(
        updateFields.startTime
      ).toISOString();
      const updatedEndTimeUTC = new Date(updateFields.endTime).toISOString();
      const appointmentStartTimeUTC = new Date(
        appointment.startTime
      ).toISOString();
      const appointmentEndTimeUTC = new Date(appointment.endTime).toISOString();

      if (
        updatedStartTimeUTC !== appointmentStartTimeUTC ||
        updatedEndTimeUTC !== appointmentEndTimeUTC
      ) {
        updateFields.status = "rescheduled";
      }
    }

    Object.assign(appointment, updateFields);

    await appointment.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment updated successfully")
      );
  } else if (role === "patient") {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Appointment not found"));
    }

    if (appointment.status !== "pending") {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, `Appointment already ${appointment.status}`)
        );
    }

    const updateFields = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (value !== "") {
        updateFields[key] = value;
      }
    }

    if ("doctor" in updateFields) {
      const hospital = await Hospital.findById(updateFields.hospital);

      if (!hospital.doctors.includes(updateFields.doctor)) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, {}, "Doctor doesn't belong to this hospital")
          );
      }
    }

    Object.assign(appointment, updateFields);

    await appointment.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment updated successfully")
      );
  } else {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id: appointmentId } = req.params;

  if (user.role !== "patient") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  if (!appointmentId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Appointment id is required"));
  }

  const appointment = await Appointment.findById(appointmentId);

  if (appointment.status !== "pending") {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          {},
          "Cannot delete appointment.Appointment already scheduled"
        )
      );
  }

  if (!appointment) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Appointment not found"));
  }

  const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedAppointment,
        "Appointment deleted successfully"
      )
    );
});

const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { startDate, endDate } = req.body;

  if (!["patient", "doctor", "hospital"].includes(role)) {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  let doctorId;

  if (role === "patient" || role === "hospital") {
    doctorId = req.body.id;
  } else {
    doctorId = req.user._id;
  }

  const pipeline = [
    {
      $match: { doctor: new mongoose.Types.ObjectId(doctorId) },
    },
    {
      $match: {
        startTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "patient",
        foreignField: "_id",
        as: "patientDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doctor",
        foreignField: "_id",
        as: "doctorDetails",
      },
    },
    {
      $lookup: {
        from: "hospitals",
        localField: "hospital",
        foreignField: "_id",
        as: "hospitalDetails",
      },
    },
    {
      $unwind: "$patientDetails",
    },

    {
      $unwind: "$doctorDetails",
    },

    // Unwind hospital details
    {
      $unwind: "$hospitalDetails",
    },

    // Project the required fields
    {
      $project: {
        _id: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        description: 1,
        patient: {
          _id: "$patientDetails._id",
          fullName: "$patientDetails.fullName",
          email: "$patientDetails.email",
        },
        doctor: {
          _id: "$doctorDetails._id",
          fullName: "$doctorDetails.fullName",
          email: "$doctorDetails.email",
          specialization: "$doctorDetails.specialization",
        },
        hospital: {
          _id: "$hospitalDetails._id",
          name: "$hospitalDetails.name",
          address: "$hospitalDetails.address",
        },
      },
    },
  ];

  try {
    const appointments = await Appointment.aggregate(pipeline);

    return res
      .status(200)
      .json(new ApiResponse(200, appointments, "Appointments fetched"));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          error.message || "Could not fetch appointments"
        )
      );
  }
});

const getDoctorAndPatientAppoinments = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  try {
    const appointments = await Appointment.find({
      doctor: doctorId,
      $or: [{ status: "scheduled" }, { status: "rescheduled" }],
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, appointments, "Appointments fetched successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          {},
          error.message || "Failed to fetch appointments"
        )
      );
  }
});

export {
  requestAppointment,
  approveOrRejectAppointment,
  rescheduleAppointment,
  getAppointmentsById,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
  getDoctorAndPatientAppoinments,
};
