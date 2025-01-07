import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Appointment } from "../models/appointment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.model.js";

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

  const { doctorId, startTime, endTime, hospitalId } = req.body;

  if (
    [doctorId, startTime, endTime, hospitalId].some(
      (field) => !field || field.trim() == ""
    )
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required"));
  }

  const isDoctorFreeBoolean = await isDoctorFree(doctorId, startTime, endTime);

  if (!isDoctorFreeBoolean) {
    return res
      .status(409)
      .json(new ApiResponse(409, {}, "Doctor is not free at this time"));
  }

  const appointment = await Appointment.create({
    patient: req.user?._id,
    doctor: doctorId,
    hospital: hospitalId,
    startTime,
    endTime,
    status: "pending",
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

  if (
    await isDoctorFree(
      appointment.doctor,
      appointment.startTime,
      appointment.endTime
    )
  ) {
    appointment.status = status;
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
        startTime: 1,
        endTime: 1,
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
    const { description } = req.body;

    if (!description) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Description is required"));
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        $set: {
          description,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Appointment not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedAppointment,
          "Appointment updated successfully"
        )
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

    console.log(updateFields);

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
  const { id: appointmentId } = req.params;

  if (!appointmentId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Appointment id is required"));
  }

  const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

  if (!deletedAppointment) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Appointment not found"));
  }

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
export {
  requestAppointment,
  approveOrRejectAppointment,
  rescheduleAppointment,
  getAppointmentsById,
  updateAppointment,
  deleteAppointment,
};
