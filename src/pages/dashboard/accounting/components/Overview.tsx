import { useEffect, useState } from "react";
import { crudRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  byCategory: Record<string, { income: number; expenses: number }>;
  byPaymentMethod: Record<string, { income: number; expenses: number }>;
}

interface DashboardStats {
  today: { revenue: number; expenses: number };
  thisMonth: { revenue: number; expenses: number };
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6"];

const OverviewSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Period Selection Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-[100px]" />
          ))}
        </div>
        <Skeleton className="h-10 w-[240px]" />
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overview Pie Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Category Bar Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Payment Method Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export function Overview() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [period, setPeriod] = useState("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatsLoading(true);
        let endpoint = `/daybook/overview?period=${period}`;

        if (period === "custom" && dateRange?.from) {
          endpoint += `&from=${dateRange.from.toISOString()}&to=${
            dateRange.to
              ? dateRange.to.toISOString()
              : dateRange.from.toISOString()
          }`;
        }

        const [overviewResponse, dashboardResponse] = await Promise.all([
          crudRequest<{ data: OverviewStats }>("GET", endpoint),
          crudRequest<{ data: DashboardStats }>(
            "GET",
            "/daybook/dashboard-stats"
          ),
        ]);

        setStats(overviewResponse.data);
        setDashboardStats(dashboardResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setStatsLoading(false);
        setDashboardStatsLoading(false);
      }
    };

    fetchData();
  }, [period, dateRange]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPeriod("custom");
  };

  if (statsLoading || !stats || !dashboardStats) {
    return <OverviewSkeleton />;
  }

  // Prepare data for charts
  const overviewData = [
    { name: "Revenue", value: stats.totalRevenue },
    { name: "Expenses", value: stats.totalExpenses },
    { name: "Net Profit", value: stats.netProfit },
  ];

  const categoryData = Object.entries(stats.byCategory).map(
    ([category, data]) => ({
      category,
      income: data.income,
      expenses: data.expenses,
    })
  );

  const paymentMethodData = Object.entries(stats.byPaymentMethod).map(
    ([method, data]) => ({
      method,
      income: data.income,
      expenses: data.expenses,
    })
  );

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === "today" ? "default" : "outline"}
            onClick={() => {
              setPeriod("today");
              setDateRange(undefined);
            }}
          >
            Today
          </Button>
          <Button
            variant={period === "week" ? "default" : "outline"}
            onClick={() => {
              setPeriod("week");
              setDateRange(undefined);
            }}
          >
            This Week
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            onClick={() => {
              setPeriod("month");
              setDateRange(undefined);
            }}
          >
            This Month
          </Button>
          <Button
            variant={period === "year" ? "default" : "outline"}
            onClick={() => {
              setPeriod("year");
              setDateRange(undefined);
            }}
          >
            This Year
          </Button>
          <Button
            variant={period === "all" ? "default" : "outline"}
            onClick={() => {
              setPeriod("all");
              setDateRange(undefined);
            }}
          >
            All Time
          </Button>
        </div>
        <DateRangePicker date={dateRange} setDate={handleDateRangeChange} />
      </div>

      {/* Overview Cards */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[150px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.netProfit)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart skeletons */}
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Overview Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overviewData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {overviewData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill={COLORS[0]} />
                  <Bar dataKey="expenses" name="Expenses" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Method Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodData}>
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill={COLORS[0]} />
                  <Bar dataKey="expenses" name="Expenses" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
