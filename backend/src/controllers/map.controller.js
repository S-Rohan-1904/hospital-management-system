import axios from "axios";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Hospital } from "../models/hospital.model.js";

const mapmyIndiaAccessToken = asyncHandler(async (req, res) => {
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

    return res
      .status(200)
      .json(new ApiResponse(200, {accessToken}, "Access token successfully fetched"))

  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { error: error.message },
          "Error fetching access token"
        )
      );
  }
})

const getNearbyHospital = asyncHandler(async (req, res) => {
  try {
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            "Something went wrong while fetching nearby hospitals"
          )
        );
    }

    const { location } = req.body;

    const nearbyHospitals = await axios.get(
      "https://atlas.mappls.com/api/places/nearby/json",
      {
        headers: {
          Authorization: `bearer ${accessToken}`,
        },
        params: {
          keywords: "hospital",
          refLocation: location, // ensure this is a valid value
          radius: 2000,
        },
      }
    );

    if (nearbyHospitals.data.suggestedLocations.length === 0) {
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Unable to fetch nearby Hospitals"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          nearbyHospitals.data.suggestedLocations,
          "Nearby Hospitals successfully fetched."
        )
      );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const getAllHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({}).populate({
    path: "doctors",
    select: "fullName _id specialization",
  });

  if (!hospitals || hospitals.length === 0) {
    return res.status(404).json(new ApiResponse(404, {}, "No hospital found"));
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

export { getNearbyHospital, getAllHospitals, mapmyIndiaAccessToken };
