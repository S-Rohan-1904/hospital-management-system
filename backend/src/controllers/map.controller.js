import axios from "axios";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://outpost.mappls.com/api/security/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.MAPMYINDIA_CLIENT_ID,
        client_secret: `${process.env.MAPMYINDIA_CLIENT_SECRET}=`,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data.access_token;

    return { accessToken }
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
  }
}

const getNearbyHospital = asyncHandler(async (req, res) => {
    
    try {
        const accessToken = await getAccessToken();
    
        if (!accessToken){
            throw new ApiError(500, "Something went wrong while fetching nearby hospitals.")
        }
    
        const NearbyHospitals = await axios.get(
            'https://atlas.mappls.com/api/places/nearby/json',
            {
                headers: {
                    "Authorization": `bearer ${accessToken}`
                }
            },
            {
                params: {
                    "keywords": "hospital",
                    "refLocation": "",
                    "radius": 5000 
                }
            },
        );
    
        if (NearbyHospitals.suggestedLocations.length===0) {
            throw new ApiError(500, "Unable to fetch nearby Hospitals")
        }
    
        return res.status(200)
        .json(
            new ApiResponse(200,
                NearbyHospitals.suggestedLocations
            )
        )
    } catch (error) {
        throw new ApiError(500, error.message || "An error occured")
    }
});

export { getNearbyHospital };