import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "./components/Overview";

const Accounting = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 ">
        <Card>
          <CardHeader>
            <CardTitle>Accounting Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Accounting;
