import { Card, CardContent } from "@/components/ui/card";
import PersonalDashboard from "./PersonalDashboard";

const StudentDashboard = () => {
  return (
    <div className="container p-4 mx-auto">
      <Card>
        <CardContent>
          <PersonalDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
