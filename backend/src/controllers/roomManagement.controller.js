import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Ward } from "../models/ward.model.js";
import { Bed } from "../models/bed.model.js";
import { User } from "../models/user.model.js";
import { AdmittedPatient } from "../models/admittedPatient.model.js";
import { FoodOrdered } from "../models/foodOrdered.model.js";
import { FoodAvailable } from "../models/foodAvailable.model.js";
import { createRazorpayOrder } from "./paymentgateway.controller.js";
import { agenda } from "../app.js"


const allotBedInWard = async (wardName, patientId, hospitalId, type) => {
  const wardObject = await Ward.findOne({
    hospital:hospitalId,
    name: wardName
  })

  const unoccupiedBed = await Bed.findOne({ ward: wardObject._id, isOccupied: false }).populate({
    path: "ward",
    select: "hospital name bedCost",
  },);

  if (!unoccupiedBed) {
    return { bedAvailable: false };
  }

  unoccupiedBed.isOccupied = true;

  await unoccupiedBed.save();

  if (type==="allot") {
    await AdmittedPatient.create({
      hospitalId,
      patientId,
      bedHistory : [
        {
          bed: unoccupiedBed._id,
          admissionDate: new Date(),
        },
      ],
      status:"admitted",
    })
  } else {
    const patient = await AdmittedPatient.findOne({
      hospitalId,
      patientId,
      status: "admitted"
    })

    const newBedHistory = {
      bed: unoccupiedBed._id, 
      admissionDate: new Date(), 
    };

    patient.bedHistory[patient.bedHistory.length-1].dischargeDate = new Date();
    
    patient.bedHistory.push(newBedHistory);
    
    await patient.save();
  }
  
  wardObject.unoccupiedBeds = Math.max(wardObject.unoccupiedBeds - 1, 0); 

  await wardObject.save();

  const bed = unoccupiedBed;

  return { bedAvailable: true, bed };
};

const getWardsInHospital = asyncHandler(async (req, res) => {
  const { role } = req.user;

  if (role !== "hospitalAdmin") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  try {
    const wardObjects = await Ward.find({
      hospital: req.user.hospitalId,
    }).populate({
      path: "hospital",
      select: "name address contact",
    });

    if (wardObjects.length === 0) {
      return res.status(404).json(new ApiResponse(404, {}, "No wards found"));
    }

    let wards = {
      hospital: wardObjects[0].hospital,
      wardDetails: {},
    };

    wardObjects.forEach((ward) => {
      const type = ward.name;
      if (wards.wardDetails[type]) {
        wards.wardDetails[type].unoccupiedBeds += ward.unoccupiedBeds;
      } else {
        wards.wardDetails[type] = {
          unoccupiedBeds: ward.unoccupiedBeds,
          bedCost: ward.bedCost,
        };
      }
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          wards,
          "Wards have been successfully fetched"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Failed to fetch wards"));
  }
});


//allot nurse still left
const allocateBeds = asyncHandler(async (req, res) => {
  const { ward, email } = req.body;

  if (req.user.role !== "hospitalAdmin") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  try {
    let bed;

    const patient = await User.findOne({ email });

    if (!patient) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Patient not found"))
    }

    const admittedPatientObject = await AdmittedPatient.findOne({
      patientId: patient._id,
      status: "admitted"
    })
    
    if (admittedPatientObject) {
      return res
        .status(409)
        .json(new ApiResponse(409, {}, "Patient is already admitted"))
    }

    bed = await allotBedInWard(ward, patient._id, req.user.hospitalId, "allot");

    if (!bed.bedAvailable) {
      return res
        .status(409)
        .json(new ApiResponse(409, {}, "No beds available in given ward"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, bed.bed, "Bed has been successfully alloted"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Failed to allot beds"));
  }
});

const changeBed = asyncHandler(async (req, res) => {
  const { email, ward } = req.body;

  if (req.user.role !== "hospitalAdmin") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  try {
    const patient = await User.findOne({email});

    const admittedPatient = await AdmittedPatient.findOne({
      patientId: patient._id,
      status: "admitted",
      hospitalId: req.user.hospitalId
    }).populate("bedHistory.bed")

    if (!admittedPatient) {
      return res
        .status(409)
        .json(new ApiResponse(409, {}, "User is not admitted.Bed cannot be changed"))
    }

    if (admittedPatient.status==="discharged") {
      return res
        .status(409)
        .json(new ApiResponse(409, {}, "User is discharged"));
    }

    const currentOccupiedBed = await Bed.findById(
      admittedPatient.bedHistory[admittedPatient.bedHistory.length - 1].bed?._id
    );
    currentOccupiedBed.isOccupied = false;
    await currentOccupiedBed.save();

    const currentWardObject = await Ward.findById(currentOccupiedBed.ward);
    currentWardObject.unoccupiedBeds = (currentWardObject.unoccupiedBeds || 0) + 1;
    await currentWardObject.save();

    let bed;

    if (ward) {
      bed = await allotBedInWard(
        ward,
        patient._id,
        req.user.hospitalId
      );

      if (!bed.bedAvailable) {
        return res
          .status(409)
          .json(new ApiResponse(409, {}, "No beds available in given ward"));
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, bed.bed, "Bed changed successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Failed to change beds"));
  }
});


//while discharge calculate the no of days stayed in each room and calculate

const getAllBedOccupation = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospitalAdmin") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const getAdmittedPatients = await AdmittedPatient.find({ hospitalId: req.user.hospitalId })
    .populate("bedHistory.bed")
    .populate("patientId", "email fullName"); // Populate email and fullName of the patient

    const flattenedResponse = await Promise.all(
      getAdmittedPatients.map(async (patient) => {
        const lastBedEntry = patient.bedHistory[patient.bedHistory.length - 1];
    
        // Fetch the ward details
        const ward = lastBedEntry?.bed?.ward
          ? await Ward.findById(lastBedEntry.bed.ward)
          : { name: "N/A" };
    
        return {
          patientId: patient.patientId?._id || "N/A", // Include patientId
          email: patient.patientId?.email || "N/A",
          fullName: patient.patientId?.fullName || "N/A",
          bedId: lastBedEntry?.bed?._id || "N/A", // Include bedId
          bedNumber: lastBedEntry?.bed?.bedNumber || "N/A",
          ward: ward?.name || "N/A",
          floor: lastBedEntry?.bed?.floor || "N/A",
          admissionDate: lastBedEntry?.admissionDate || "N/A",
          dischargeDate: lastBedEntry?.dischargeDate || "Still Admitted",
        };
      })
    );

  return res
    .status(200)
    .json(new ApiResponse(200, flattenedResponse, "Patients successfully fetched"));
});



const getFoodAvailable = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospitalAdmin") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const foodAvailable = await FoodAvailable.find({
    hospitalId: req.user.hospitalId,
    available: true,
  })

  return res
    .status(200)
    .json(new ApiResponse(200, foodAvailable, "Food items successfully fetched"))
})

const orderFood = asyncHandler(async (req, res) => {
  if (req.user.role !== "hospitalAdmin") {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden request"));
  }

  const { orders } = req.body;

  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json(new ApiResponse(400, {}, "Orders must be an array and cannot be empty"));
  }

  try {
    const createdOrders = [];

    for (const order of orders) {
      const { email, foodId, quantity } = order;

      if (!email || !foodId || !quantity) {
        return res.status(400).json(new ApiResponse(400, {}, "Each order must include admittedPatientId, foodId, and quantity"));
      }

      const patientUserObject = await User.findOne({email});

      const admittedPatient = await AdmittedPatient.findOne({patientId: patientUserObject._id});
      
      if (!admittedPatient) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Patient does not exist"))
      }

      const foodItem = await FoodAvailable.findById(foodId);
      if (!foodItem) {
        return res.status(404).json(new ApiResponse(404, {}, `Food item with id ${foodId} not found`));
      }

      const totalPrice = foodItem.price * quantity;

      // Create the food order entry
      const foodOrder = await FoodOrdered.create({
        admittedPatientId: admittedPatient._id,
        foodId,
        quantity,
        totalPrice,
      });

      createdOrders.push(foodOrder);
    }

    return res.status(201).json(
      new ApiResponse(201, createdOrders, "Food orders successfully placed")
    );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, {}, error.message || "Failed to place food orders"));
  }
});


const calculateCost = async (bedHistory) => {
  const cost = {};

  for (let index = 0; index < bedHistory.length; index++) {
    const entry = bedHistory[index];
    const wardObject = await Ward.findById(entry.bed.ward);
    const admissionDate = new Date(entry.admissionDate);
    const dischargeDate = entry.dischargeDate ? new Date(entry.dischargeDate) : new Date();

    let durationInDays;

    durationInDays = Math.ceil(
      (new Date(dischargeDate) - new Date(admissionDate)) / (1000 * 60 * 60 * 24)
    );
  
    if (cost[wardObject.name]) {
      cost[wardObject.name] += durationInDays * wardObject.bedCost;
    } else {
      cost[wardObject.name] = durationInDays * wardObject.bedCost;
    }
  }
    

  return cost;
};


const dischargePatient = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const patient = await User.findOne({email});

  const admittedPatientObject = await AdmittedPatient.findOne({
    patientId: patient._id,
    status: "admitted"
  })
  .populate("bedHistory.bed")
  .populate("patientId", "email fullName");

  admittedPatientObject.bedHistory[admittedPatientObject.bedHistory.length - 1].dischargeDate = new Date()

  const totalCost = await calculateCost(admittedPatientObject.bedHistory);

  const foodOrders = await FoodOrdered.aggregate([
    {
      $match: { admittedPatientId: admittedPatientObject._id } // Filter by the admitted patient
    },
    {
      $group: {
        _id: null, // We don’t need to group by any specific field, we just want the sum
        totalAmount: { $sum: "$totalPrice" } // Sum the totalPrice field
      }
    }
  ]);
  
  const totalAmount = foodOrders.length > 0 ? foodOrders[0].totalAmount : 0;

  totalCost.Food = totalAmount

  const lastOccupiedBed = await Bed.findById(
    admittedPatientObject.bedHistory[admittedPatientObject.bedHistory.length - 1].bed._id
  )

  lastOccupiedBed.isOccupied = false;
  await lastOccupiedBed.save();

  const lastOccupiedWard = await Ward.findById(lastOccupiedBed.ward);
  lastOccupiedWard.unoccupiedBeds = lastOccupiedWard.unoccupiedBeds + 1;
  await lastOccupiedWard.save()

  const amount = Object.values(totalCost).reduce((sum, value) => sum + value, 0);

  
  async function sendDischargeEmail(email, data, amount) {

    let rows = '';
    let totalCost = 0;

    // Calculate total cost dynamically
    for (const service in data) {
      rows += `
        <tr>
          <td>${service}</td>
          <td>${data[service]}</td>
        </tr>
      `;
      totalCost += data[service];
    }
    
    // The HTML string with dynamic content
    const htmlToSendInMail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
        }
        h1 {
          color: #4CAF50;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }
        table th, table td {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }
        table th {
          background-color: #f2f2f2;
      }
      table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    </style>
  </head>
  <body>
    <h1>Total Cost Breakdown</h1>
    <p>Below is the detailed breakdown of the total cost:</p>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Cost (in currency)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
      <th>Total</th>
          <th>${totalCost}</th>
        </tr>
      </tbody>
    </table>
    <p>If you have any questions or need further details, please let us know.</p>
  </body>
  </html>
`;

  
    // Send email using Agenda
    await agenda.now("send email", {
      to: email,
      subject: "Discharge Receipt",
      text: "",
      html: htmlToSendInMail,
    });
  }  

  await sendDischargeEmail(email , totalCost, amount);

  await createRazorpayOrder(amount*100, "discharge", patient._id);

  admittedPatientObject.status = "payment pending"
  await admittedPatientObject.save()

  return res
    .status(200)
    .json(new ApiResponse(200, admittedPatientObject, "Patient discharged"))

})


export {
  getWardsInHospital,
  allocateBeds,
  changeBed,
  getFoodAvailable,
  orderFood,
  getAllBedOccupation,
  dischargePatient,
};
