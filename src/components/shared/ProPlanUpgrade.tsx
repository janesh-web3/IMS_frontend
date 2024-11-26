import React from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui button
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProPlanUpgrade: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    try {
      await crudRequest("PUT", "/packages/update-package", {
        plan: "Standard",
      }).then(() => {
        toast.success("Package subscribed successfully");
        navigate("/");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    } catch (error) {
      toast("Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
      <Card className="w-full max-w-md rounded-lg shadow-xl bg-gradient-to-r from-yellow-900 via-yellow-700 to-yellow-400">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-100">Pro Plan</h2>
          <p className="text-lg text-gray-300">
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
