import { useEffect, useState } from "react";
import { crudRequest } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SessionData {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  loginTime: string;
  logoutTime: string;
  duration: number;
  userType: string;
}

interface SessionStats {
  totalSessions: number;
  averageDuration: number;
  userTypeDistribution: Record<string, number>;
  dailySessionCounts: Record<string, number>;
}

interface SessionResponse {
  success: boolean;
  message?: string;
  sessions: SessionData[];
  stats: SessionStats;
}

interface DetailedSessionData extends SessionData {
  correlationData?: {
    duration: number;
    timeOfDay: number;
    dayOfWeek: number;
  };
}

export function Control() {
  const [sessionData, setSessionData] = useState<DetailedSessionData[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] =
    useState<DetailedSessionData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const fetchSessionData = async () => {
    try {
      const response = await crudRequest<SessionResponse>(
        "GET",
        "/session/all"
      );

      if (response.success) {
        setSessionData(processSessionData(response.sessions));
        setStats(response.stats);
      } else {
        toast.error("Failed to load session data");
      }
    } catch (error) {
      toast.error("Error loading session data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const processSessionData = (
    sessions: SessionData[]
  ): DetailedSessionData[] => {
    return sessions.map((session) => ({
      ...session,
      correlationData: {
        duration: session.duration,
        timeOfDay: new Date(session.loginTime).getHours(),
        dayOfWeek: new Date(session.loginTime).getDay(),
      },
    }));
  };

  const handleSessionClick = (session: DetailedSessionData) => {
    setSelectedSession(session);
    setShowDetailDialog(true);
  };

  // Calculate hourly distribution
  const getHourlyDistribution = () => {
    const hourly: Record<number, number> = {};
    sessionData.forEach((session) => {
      const hour = new Date(session.loginTime).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    return Object.entries(hourly).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }));
  };

  // Correlation data for scatter plot
  const getCorrelationData = () => {
    return sessionData.map((session) => ({
      duration: session.duration / 60, // Convert to minutes
      timeOfDay: new Date(session.loginTime).getHours(),
      userType: session.userType,
    }));
  };

  const SessionDetailDialog = () => (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">User</h4>
                  <p>{selectedSession?.userId.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold">User Type</h4>
                  <p className="capitalize">{selectedSession?.userType}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Login Time</h4>
                  <p>
                    {new Date(
                      selectedSession?.loginTime || ""
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Duration</h4>
                  <p>{formatDuration(selectedSession?.duration || 0)}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="correlation">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="timeOfDay"
                    name="Time of Day"
                    unit="h"
                  />
                  <YAxis
                    type="number"
                    dataKey="duration"
                    name="Duration"
                    unit="min"
                  />
                  <ZAxis range={[100]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  <Scatter
                    name="Sessions"
                    data={getCorrelationData()}
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-[100px]" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container p-2 mx-auto mb-10 space-y-6 md:p-4">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Sessions</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {stats?.totalSessions.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Average Duration</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {stats ? formatDuration(stats.averageDuration) : "0h 0m"}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Add more stat cards as needed */}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Sessions by user type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(stats?.userTypeDistribution || {}).map(
                    ([type, count]) => ({
                      type: type.charAt(0).toUpperCase() + type.slice(1),
                      count,
                    })
                  )}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} interval={0} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Daily Sessions Chart with click interaction */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Sessions</CardTitle>
            <CardDescription>Click on points to see details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Object.entries(stats?.dailySessionCounts || {}).map(
                    ([date, count]) => ({
                      date,
                      sessions: count,
                    })
                  )}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e", r: 4 }}
                    activeDot={{
                      r: 6,
                      onClick: (event: any) => {
                        const session = sessionData.find(
                          (s) =>
                            new Date(s.loginTime).toLocaleDateString() ===
                            event.payload.date
                        );
                        if (session) handleSessionClick(session);
                      },
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Hourly Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
            <CardDescription>Session frequency by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getHourlyDistribution()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={0} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px",
                    }}
                    formatter={(value, _name, props) => [
                      `${value} sessions`,
                      `${props.payload.hour}:00`,
                    ]}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Detail Dialog */}
      <SessionDetailDialog />

      {/* Recent Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Click on a row to see details</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionData.map((session) => (
                  <TableRow
                    key={session._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSessionClick(session)}
                  >
                    <TableCell className="font-medium">
                      {session.userId.name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {session.userType}
                    </TableCell>
                    <TableCell>
                      {new Date(session.loginTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDuration(session.duration)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
