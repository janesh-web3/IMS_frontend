import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";

type StatsType = {
  overview: {
    totalTeachers: number;
    totalSubjectsAssigned: number;
    totalCoursesAssigned: number;
    averageSubjectsPerTeacher: string;
  };
  teacherStats: {
    teacherName: string;
    subjectCount: number;
    courseCount: number;
    salary: number;
    percentage: string;
  }[];
};

const TeacherStats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await crudRequest<StatsType>("GET", "/faculty/stats");
        setStats(response);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-2 md:space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm text-muted-foreground">
              Total Teachers
            </span>
            <span className="text-lg md:text-2xl font-bold">
              {stats.overview.totalTeachers}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm text-muted-foreground">
              Total Subjects Assigned
            </span>
            <span className="text-lg md:text-2xl font-bold">
              {stats.overview.totalSubjectsAssigned}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm text-muted-foreground">
              Total Courses Assigned
            </span>
            <span className="text-lg md:text-2xl font-bold">
              {stats.overview.totalCoursesAssigned}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm text-muted-foreground">
              Avg Subjects/Teacher
            </span>
            <span className="text-lg md:text-2xl font-bold">
              {stats.overview.averageSubjectsPerTeacher}
            </span>
          </div>
        </Card>
      </div>

      {/* Teacher-wise Stats */}
      <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4 pb-6">
        {stats.teacherStats.map((teacher, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <h3 className="text-xs md:text-sm font-semibold">
                {teacher.teacherName}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Subjects: </span>
                  <span className="font-medium">{teacher.subjectCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Courses: </span>
                  <span className="font-medium">{teacher.courseCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Salary: </span>
                  <span className="text-xs md:text-sm font-medium">
                    ₹{teacher.salary}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Share: </span>
                  <span className="text-xs md:text-sm font-medium">
                    {teacher.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherStats;
