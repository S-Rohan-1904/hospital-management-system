import axios from "axios";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.model.js";
import { User } from "../models/user.model.js";

async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://outpost.mappls.com/api/security/oauth/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.MAPMYINDIA_CLIENT_ID,
        client_secret: `${process.env.MAPMYINDIA_CLIENT_SECRET}=`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;

    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Error fetching access token", error.message);
  }
}

const getNearbyHospital = asyncHandler(async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new ApiError(
        404,
        "Something went wrong while fetching nearby hospitals."
      );
    }

    const NearbyHospitals = await axios.get(
      "https://atlas.mappls.com/api/places/nearby/json",
      {
        headers: {
          Authorization: `bearer ${accessToken}`,
        },
      },
      {
        params: {
          keywords: "hospital",
          refLocation: "",
          radius: 5000,
        },
      }
    );

    if (NearbyHospitals.suggestedLocations.length === 0) {
      throw new ApiError(500, "Unable to fetch nearby Hospitals");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          NearbyHospitals.suggestedLocations,
          "Nearby Hospitals successfully fetched."
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || "An error occured");
  }
});

const getAllHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({}).populate({
    path: "doctors",
    select: "fullName _id specialization",
  });

  if (!hospitals || hospitals.length === 0) {
    throw new ApiError(404, "No hospital found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        hospitals,
        "Hospitals have been successfully fetched."
      )
    );
});

export { getNearbyHospital, getAllHospitals };
