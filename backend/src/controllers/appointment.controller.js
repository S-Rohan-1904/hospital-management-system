import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { Appointment } from "../models/appointment.model";
const requestAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "patient") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { doctorId, date, time, hospitalId, slot } = req.body;

  if (
    [doctorId, date, time, hospitalId, slot].some(
      (field) => !field || field.trim() == ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    hospital: hospitalId,
    date,
    slot,
    status: "pending",
  });

  if (!appointment) {
    throw new ApiError(500, "Failed to request appointment");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, appointment, "Appointment request sent successfully")
    );
});

const approveAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  const appointmentId = req.params?.id;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment id is required");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.doctor !== req.user._id) {
    throw new ApiError(403, "Forbidden request");
  }

  if (appointment.status !== "pending") {
    throw new ApiError(409, "Appointment already approved");
  }

  appointment.status = "approved";
  await appointment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment approved"));
});

const rejectAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }

  const appointmentId = req.params?.id;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment id is required");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.doctor !== req.user._id) {
    throw new ApiError(403, "Forbidden request");
  }

  if (appointment.status !== "pending") {
    throw new ApiError(
      409,
      `Appointment has already been ${appointment.status}`
    );
  }

  appointment.status = "rejected";
  await appointment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment rejected successfully")
    );
});

const rescheduleAppointment = asyncHandler(async (req, res) => {
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
  }
  const { date, slot } = req.body;

  if (!date && !slot) {
    throw new ApiError(400, "All fields are required");
  }

  const appointmentId = req.params?.id;

  if (!appointmentId) {
    throw new ApiError(400, "Appointment id is required");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.doctor !== req.user._id) {
    throw new ApiError(403, "Forbidden request");
  }

  if (appointment.status !== "scheduled") {
    throw new ApiError(409, "Appointment has to be scheduled first");
  }

  appointment.status = "rescheduled";
  appointment.date = date;
  appointment.slot = slot;
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

const getAppointments = asyncHandler(async (req, res) => {
  const { _id, role } = req.user;
  const userId = _id;

  if (role !== "patient" || role !== "doctor") {
    throw new ApiError(403, "Forbidden request");
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
      $unwind: "$patientDetails",
    },
    {
      $unwind: "$doctorDetails",
    },
    {
      $unwind: "$hospitalDetails",
    },
    {
      $project: {
        _id: 1,
        date: 1,
        slot: 1,
        status: 1,
        patient: {
          _id: "$patientDetails._id",
          fullName: "$patientDetails.fullName",
          email: "$patientDetails.email",
        },
        doctor: {
          _id: "$doctorDetails._id",
          fullName: "$doctorDetails.fullName",
          email: "$doctorDetails.email",
        },
        hospital: {
          _id: "$hospitalDetails._id",
          name: "$hospitalDetails.name",
          address: "$hospitalDetails.address",
        },
      },
    },
  ];

  const appointments = await Appointment.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Appointments fetched"));
});

export {
  requestAppointment,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  getAppointments,
};
