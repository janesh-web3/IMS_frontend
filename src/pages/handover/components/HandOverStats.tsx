import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";

type StatsType = {
  overview: {
    totalHandovers: number;
    todayCount: number;
    todayAmount: number;
    weekCount: number;
    weekAmount: number;
  };
  adminStats: {
    name: string;
    count: number;
    total: number;
  }[];
};

const HandOverStats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await crudRequest<StatsType>("GET", "/handover/stats");
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Total Handovers
            </span>
            <span className="text-xl font-bold">
              {stats.overview.totalHandovers}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Today's Count</span>
            <span className="text-xl font-bold">
              {stats.overview.todayCount}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Today's Amount
            </span>
            <span className="text-xl font-bold">
              ₹{stats.overview.todayAmount}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Week's Count</span>
            <span className="text-xl font-bold">
              {stats.overview.weekCount}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Week's Amount</span>
            <span className="text-xl font-bold">
              ₹{stats.overview.weekAmount}
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-3">
        <h3 className="mb-2 text-sm font-semibold">Admin Handovers</h3>
        <div className="max-h-[200px] overflow-y-auto">
          {stats.adminStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1.5 border-b last:border-0"
            >
              <span className="text-xs text-muted-foreground">{stat.name}</span>
              <div className="flex gap-4">
                <span className="text-xs font-medium">
                  {stat.count} handovers
                </span>
                <span className="text-xs font-medium">₹{stat.total}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HandOverStats;
