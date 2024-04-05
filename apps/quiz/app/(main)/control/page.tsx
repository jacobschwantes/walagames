"use client";
import type { NextPage } from "next";
import { useState, useEffect, useRef } from "react";
interface PageProps {}
const Page: NextPage<PageProps> = ({}) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <CastButton />
    </main>
  );
};
export default Page;



const CastButton = () => {
  const presentationRef = useRef(null);

  useEffect(() => {
    const presentationRequest = new PresentationRequest([
      "http://localhost:3000/present",
    ]);

    // Listen for availability changes
    presentationRequest.addEventListener("connectionavailable", (event) => {
      const connection = event.connection;
      console.log("Presentation connection available:", connection);
      presentationRef.current = connection;

      // Set up a message listener for the presentation connection
      connection.onmessage = (event) => {
        console.log("Message from presentation:", event.data);
      };
    });

    // Start monitoring the list of available presentation displays
    presentationRequest.getAvailability().then((availability) => {
      console.log("Presentation displays are available:", availability.value);
      availability.addEventListener("change", () => {
        console.log(
          "Availability change, displays are available:",
          availability.value
        );
      });
    });

    // Set the default request for the Cast button
    navigator.presentation.defaultRequest = presentationRequest;
  }, []);

  const startPresentation = () => {
    if (!presentationRef.current) {
      navigator.presentation.defaultRequest
        .start()
        .then((connection) => {
          console.log("Presentation started:", connection);
          presentationRef.current = connection;
        })
        .catch((error) => {
          console.error("Failed to start presentation:", error);
        });
    } else {
      console.log("Presentation already started");
    }
  };

  const sendMessage = () => {
    if (presentationRef.current) {
      presentationRef.current.send("Hello, TV!");
    } else {
      console.log("No presentation connection");
    }
  };

  return (
    <div>
      <button onClick={startPresentation}>Cast to TV</button>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};


