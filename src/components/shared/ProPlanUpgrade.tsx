import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type PlanType = "Basic" | "Premium" | "PremiumPlus";

interface PlanDetails {
  name: PlanType;
  price: number;
  features: string[];
}

const plans: PlanDetails[] = [
  {
    name: "Basic",
    price: 0,
    features: [
      "Limited features",
      "Basic support",
      "Standard students limits",
      "Basic analytics",
    ],
  },
  {
    name: "Premium",
    price: 2000,
    features: [
      "Access to premium features",
      "Priority support",
      "Increased students limits",
      "Advanced analytics & reporting",
      "Notification Systems",
      "Web App Timer Analytics",
      "Upto 10 Quiz System",
      "Print, Export Functionality",
    ],
  },
  {
    name: "PremiumPlus",
    price: 3000,
    features: [
      "All Premium features",
      "VIP support",
      "Unlimited students",
      "Advanced analytics & reporting",
      "Custom branding",
      "API access",
      "Unlimited Quiz System",
      "Advanced integrations",
      "Priority feature requests",
    ],
  },
];

const ProPlanUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Premium");

  const handleSubscribe = async () => {
    console.log(selectedPlan);
    try {
      await crudRequest("PUT", "/packages/update-package", {
        plan: selectedPlan,
      }).then(() => {
        toast.success("Package subscribed successfully");
        navigate("/");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-card p-4 my-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`rounded-lg shadow-xl transition-all duration-300 ${
              selectedPlan === plan.name
                ? "scale-105 bg-gradient-to-r from-yellow-900 via-yellow-700 to-yellow-400"
                : "bg-card hover:scale-102"
            }`}
          >
            <CardHeader className="text-center">
              <h2
                className={`text-2xl font-extrabold ${
                  selectedPlan === plan.name ? "text-gray-100" : "text-primary"
                }`}
              >
                {plan.name}
              </h2>
              <p
                className={`text-lg ${
                  selectedPlan === plan.name
                    ? "text-gray-300"
                    : "text-muted-foreground"
                }`}
              >
                {plan.price === 0 ? "Free" : `रू${plan.price}/month`}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2 text-yellow-300">✔</span>
                    <span
                      className={
                        selectedPlan === plan.name
                          ? "text-gray-200"
                          : "text-foreground"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-center mt-2">
              <Button
                variant={selectedPlan === plan.name ? "default" : "outline"}
                className={`w-full ${
                  selectedPlan === plan.name
                    ? "bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
                    : ""
                }`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {selectedPlan === plan.name ? "Selected" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Button
        className="fixed bottom-8 right-20 bg-yellow-500 text-black font-semibold hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.8)]"
        onClick={handleSubscribe}
      >
        Confirm Subscription
      </Button>
    </div>
  );
};

export default ProPlanUpgrade;
