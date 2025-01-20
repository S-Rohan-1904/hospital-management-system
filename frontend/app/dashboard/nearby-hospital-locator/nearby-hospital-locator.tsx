"use client";

import axios from "axios";
import { useEffect, useState } from "react";

const MapComponent: React.FC = () => {
  const [userCoordinates, setUserCoordinates] = useState<
    [number, number] | null
  >(null);

  const getOAuthToken = async () => {
    const url = "https://outpost.mappls.com/api/security/oauth/token";

    try {
      const response = await axios.post(
        url,
        {
          grant_type: "client_credentials",
          client_id: process.env.NEXT_PUBLIC_MAPMYINDIA_CLIENT_ID,
          client_secret: `${process.env.NEXT_PUBLIC_MAPMYINDIA_CLIENT_SECRET}=`,
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      console.log("response", response);

      //   const response = await fetch(url, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/x-www-form-urlencoded",
      //     },
      //     body: body.toString(),
      //   });

      //   if (response.ok) {
      //     const data = await response.json();
      //     console.log("OAuth Token Response:", data);
      //     return data.access_token;
      //   } else {
      //     console.error("Failed to fetch OAuth token:", await response.text());
      //     return null;
      //   }
    } catch (error) {
      console.error("Error fetching OAuth token:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAndSetupMap = async () => {
      const token = await getOAuthToken();
      if (!token) {
        console.error(
          "Failed to fetch OAuth token. Map functionality may be limited."
        );
        return;
      }

      const getUserLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("User coordinates:", latitude, longitude);

              setUserCoordinates([latitude, longitude]);

              // Initialize the map
              const map = new (window as any).MapmyIndia.Map("map", {
                center: [latitude, longitude],
                zoom: 15,
              });

              // Add a marker for the user's location
              new (window as any).L.Marker([latitude, longitude])
                .addTo(map)
                .bindPopup("You are here!")
                .openPopup();

              // Fetch hospitals nearby
              await fetchNearbyHospitals(latitude, longitude, map, token);
            },
            (error) => {
              console.error("Error getting user location:", error);
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
        }
      };

      const fetchNearbyHospitals = async (
        latitude: number,
        longitude: number,
        map: any,
        token: string
      ) => {
        const radius = 5000; // 5km radius
        const category = "HOSPITAL"; // Category for hospitals

        const url = `https://atlas.mapmyindia.com/api/places/nearby/json?keywords=${category}&refLocation=${latitude},${longitude}&radius=${radius}`;

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Nearby hospitals data:", data);

            if (data?.suggestedLocations) {
              data.suggestedLocations.forEach((hospital: any) => {
                const { latitude, longitude, placeName } = hospital;

                // Add a marker for each hospital
                new (window as any).L.Marker([latitude, longitude])
                  .addTo(map)
                  .bindPopup(placeName || "Hospital")
                  .openPopup();
              });
            }
          } else {
            console.error("Error fetching hospitals:", await response.text());
          }
        } catch (error) {
          console.error("Error during API call:", error);
        }
      };

      // Load the MapmyIndia script
      const script = document.createElement("script");
      script.src = `https://apis.mapmyindia.com/advancedmaps/v1/${process.env.NEXT_PUBLIC_MAPMYINDIA_API_KEY}/map_load?v=1.5`;
      script.async = true;
      script.onload = getUserLocation;
      document.body.appendChild(script);

      return () => {
        // Cleanup script
        document.body.removeChild(script);
      };
    };

    fetchAndSetupMap();
  }, []);

  return (
    <div
      id="map"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default MapComponent;