import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";

type StatsType = {
  overview: {
    totalCourses: number;
    totalSubjects: number;
    totalBooks: number;
  };
  courseStats: {
    courseName: string;
    subjectCount: number;
    bookCount: number;
  }[];
};

const CourseStats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await crudRequest<StatsType>("GET", "/course/stats");
        setStats(response);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Courses</span>
            <span className="text-2xl font-bold">
              {stats.overview.totalCourses}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Total Subjects
            </span>
            <span className="text-2xl font-bold">
              {stats.overview.totalSubjects}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Books</span>
            <span className="text-2xl font-bold">
              {stats.overview.totalBooks}
            </span>
          </div>
        </Card>
      </div>

      {/* Course-wise Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.courseStats.map((course, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold">{course.courseName}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Subjects: </span>
                  <span className="font-medium">{course.subjectCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Books: </span>
                  <span className="font-medium">{course.bookCount}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseStats;
