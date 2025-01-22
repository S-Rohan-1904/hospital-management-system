"use client";
import React, { useRef, useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const ZegoVideoConference = ({
  appID,
  tokenServerUrl,
}: {
  appID: number;
  tokenServerUrl: string;
}) => {
  const callContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper function to generate a random string for userID and roomID
  const randomID = (len = 5) => {
    const chars =
      "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
    return Array.from({ length: len })
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join("");
  };

  const getUrlParams = (
    url: string = window.location.href
  ): URLSearchParams => {
    const queryString = url.split("?")[1];
    return new URLSearchParams(queryString);
  };

  useEffect(() => {
    const roomID = getUrlParams().get("roomID") || randomID(5);
    const userID = randomID(5);
    const userName = randomID(5);

    // Generate the token from your backend
    const generateToken = async () => {
      const response = await fetch(
        `${tokenServerUrl}/token?userID=${userID}&expired_ts=7200`
      );
      const data = await response.json();
      return data.token;
    };

    // Initialize ZegoUIKit with the generated token
    const initializeCall = async () => {
      if (!callContainerRef.current) return;
      const token = await generateToken();
      const zegoToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appID,
        token,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(zegoToken);

      zp.joinRoom({
        container: callContainerRef.current,
        sharedLinks: [
          {
            name: "Personal link",
            url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    };

    initializeCall();
  }, [appID, tokenServerUrl]);

  return (
    <div
      ref={callContainerRef}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
};

export default ZegoVideoConference;
