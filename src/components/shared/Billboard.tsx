import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { crudRequest } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const Billboard = () => {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      await crudRequest("PUT", "/packages/update-package", {
        plan: "Basic",
      }).then(() => {
        toast.success("Switched to basic package");
        navigate("/");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    } catch (error) {
      toast("Failed to switch. Please try again.");
    }
  };
  return (
    <div>
      {" "}
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
            <h3 className="text-lg font-semibold text-yellow-400">
              Switch to Basic
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-center text-gray-400">
              Switch to basic package.
            </p>

            {/* Button */}
            <Button
              className="mt-4 w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              onClick={onClick}
            >
              Switch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billboard;
