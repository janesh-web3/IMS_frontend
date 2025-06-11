import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid, LayoutDashboard } from "lucide-react";

export type ViewMode = "list" | "board" | "dashboard";

interface ViewSwitcherProps {
  currentView: ViewMode;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView }) => {
  const navigate = useNavigate();
  
  const handleViewChange = (view: ViewMode) => {
    if (view === currentView) return;
    
    switch (view) {
      case "list":
        navigate("/tasks");
        break;
      case "board":
        navigate("/tasks/board");
        break;
      case "dashboard":
        navigate("/tasks/dashboard");
        break;
    }
  };
  
  return (
    <div className="flex bg-gray-100 rounded-md p-1">
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleViewChange("list")}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        variant={currentView === "board" ? "default" : "ghost"}
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleViewChange("board")}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Board</span>
      </Button>
      <Button
        variant={currentView === "dashboard" ? "default" : "ghost"}
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleViewChange("dashboard")}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Button>
    </div>
  );
};

export default ViewSwitcher; 