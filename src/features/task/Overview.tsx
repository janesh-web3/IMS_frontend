import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Overview = () => {
  return (
    <div>
      <div className="grid gap-2 md:gap-3 md:grid-cols-2 lg:grid-cols-5">
        {/* total task */}
        <Link to="/task/list">
          <Card className="bg-dashboard3 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Total Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">10</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                created upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* complete task */}
        <Link to="/task/list">
          <Card className="bg-dashboard4 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Completed Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">9</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                completed upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* pending task */}
        <Link to="/task/list">
          <Card className="bg-dashboard6 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                In Progress Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">10</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                in progress upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* overdue task */}
        <Link to="/task/list">
          <Card className="bg-dashboard5 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Overdue Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">0</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                overdue upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* todos */}
        <Link to="/task/list">
          <Card className="bg-dashboard7 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Todos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">0</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                todos upto date.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Overview;
