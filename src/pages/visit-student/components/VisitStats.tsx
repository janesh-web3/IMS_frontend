import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";

type StatsType = {
  overview: {
    totalVisits: number;
    todayVisits: number;
    weekVisits: number;
    averageVisitsPerDay: string;
  };
  courseStats: {
    name: string;
    count: number;
  }[];
  subjectStats: {
    name: string;
    count: number;
  }[];
};

const VisitStats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await crudRequest<StatsType>("GET", "/visit/stats");
        setStats(response);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Visits</span>
            <span className="text-xl font-bold">
              {stats.overview.totalVisits}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Today's Visits
            </span>
            <span className="text-xl font-bold">
              {stats.overview.todayVisits}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">This Week</span>
            <span className="text-xl font-bold">
              {stats.overview.weekVisits}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Daily Average</span>
            <span className="text-xl font-bold">
              {stats.overview.averageVisitsPerDay}
            </span>
          </div>
        </Card>
      </div>

      {/* Course and Subject Interest */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-3">
          <h3 className="mb-2 text-sm font-semibold">Top Courses Interest</h3>
          <div className="max-h-[200px] overflow-y-auto">
            {stats.courseStats.map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 border-b last:border-0"
              >
                <span className="text-xs text-muted-foreground truncate mr-2">
                  {course.name}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {course.count} visits
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-3">
          <h3 className="mb-2 text-sm font-semibold">Top Subjects Interest</h3>
          <div className="max-h-[200px] overflow-y-auto">
            {stats.subjectStats.map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 border-b last:border-0"
              >
                <span className="text-xs text-muted-foreground truncate mr-2">
                  {subject.name}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {subject.count} visits
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisitStats;
