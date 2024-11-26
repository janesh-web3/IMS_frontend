import React from "react";
import { Button } from "@/components/ui/button"; // Import from Shadcn UI or your custom button component

interface UpgradeToProProps {
  onClick: () => void; // Callback for when the button is clicked
}

const UpgradeToPro: React.FC<UpgradeToProProps> = ({ onClick }) => {
  return (
    <div className="mt-4 rounded-lg bg-gradient-to-br from-black via-gray-900 to-gray-800 p-[1px] shadow-lg">
      {/* Inner Container */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-black via-gray-950 to-gray-800">
        <div className="flex flex-col items-center">
          {/* Icon with Glow */}
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-300 p-1 shadow-[0_0_15px_rgba(255,215,0,0.5)]">
            <span className="flex items-center justify-center w-full h-full text-lg font-bold text-yellow-400 bg-black rounded-full">
              🌟
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-yellow-400">Go Premium</h3>

          {/* Description */}
          <p className="mt-2 text-sm text-center text-gray-400">
            Unlock exclusive features and level up your productivity.
          </p>

          {/* Button */}
          <Button
            className="mt-4 w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.8)]"
            onClick={onClick}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToPro;
