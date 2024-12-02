import { useState, useEffect } from "react";
import UserNav from "./user-nav";
import { crudRequest } from "@/lib/api";
import PremiumComponent from "./PremiumComponent";

const TimeTracker = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0); // Timer shown on the UI
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false); // To track if session is active

  // Function to initialize the timer when the user logs in
  const initializeTimer = () => {
    const token = sessionStorage.getItem("token");

    if (token) {
      const storedStartTime = sessionStorage.getItem("startTime");
      let start = storedStartTime ? new Date(storedStartTime) : new Date();
      if (!storedStartTime) {
        sessionStorage.setItem("startTime", start.toISOString());
      }
      setStartTime(start);
      setIsSessionActive(true); // Mark session as active

      // Calculate elapsed time since the last session start
      const elapsedSeconds = Math.floor(
        (new Date().getTime() - start.getTime()) / 1000
      );
      setCurrentTime(elapsedSeconds);

      // Start the interval to update the timer on the UI
      const intervalId = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);

      // Clean up the interval when component unmounts
      return () => clearInterval(intervalId);
    }
  };

  useEffect(() => {
    initializeTimer();
  }, []);

  const saveSessionTime = async () => {
    const endTime = new Date();
    if (startTime) {
      const sessionTime = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds

      try {
        // Send the session data to the backend
        await crudRequest("POST", "/session/start", {
          startTime,
          endTime,
          sessionDuration: sessionTime,
        });

        // Clean up session storage
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("startTime");
        console.log("Session time saved:", sessionTime);
        window.location.reload();
      } catch (error) {
        console.error("Error saving session time:", error);
      }
    }
  };

  // Handle manual logout
  const handleLogout = () => {
    if (isSessionActive) {
      saveSessionTime(); // Save session time on manual logout
      setIsSessionActive(false); // Mark session as inactive
    }
  };

  return (
    <div className="flex items-center justify-center">
      <PremiumComponent>
        <div className="px-2 text-[0.6rem] font-thin md:font-semibold md:text-lg ">
          {Math.floor(currentTime / 60)} <b className="text-gray-400">MIN</b>{" "}
          {currentTime % 60} <b className="text-gray-400">SEC</b>
        </div>
      </PremiumComponent>
      <div>
        <UserNav handleLogout={handleLogout} />
      </div>
    </div>
  );
};

export default TimeTracker;
