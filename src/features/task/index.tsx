import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Overview from "./Overview";
import List from "./List";
import Board from "./Board";

const TaskManagement = () => {
  const [view, setView] = useState("overview");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Task Management</h1>

      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview />
        </TabsContent>

        <TabsContent value="board">
          <Board />
        </TabsContent>

        <TabsContent value="list">
          <List />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManagement;
