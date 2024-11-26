import React from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui button
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import axios from "axios";
import { toast } from "../ui/use-toast";

const ProPlanUpgrade: React.FC = () => {
  const handleSubscribe = async () => {
    try {
      const response = await axios.post("/api/subscribe", { plan: "pro" });
      toast({
        title: "Success",
        description: "You are now subscribed to Pro Plan!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
      <Card className="w-full max-w-md rounded-lg shadow-xl bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-300">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">Pro Plan</h2>
          <p className="text-lg text-gray-800">
            Take your experience to the next level
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-white">
              रू<span className="text-yellow-200">2000</span>{" "}
              <span className="text-sm">/month</span>
            </h3>
          </div>
          <ul className="mt-4 space-y-1 text-gray-200 list-none">
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Access to premium
              features
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Priority support
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Increased
              students limits
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Advanced
              analytics & reporting
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Notification
              Systems
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Web App Timer
              Analytics
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Upto 10 Quiz
              System
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Print, Export
              Functionality
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-300">✔</span> Photo Upload and
              Webcam System
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center mt-2">
          <Button
            variant="ghost"
            className="w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.8)] hover:text-gray-950"
            onClick={handleSubscribe}
          >
            Subscribe for रू2000/month
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProPlanUpgrade;
