import { useState, useEffect } from "react";
import type { Student } from "@/types";
import { crudRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface Course {
  _id: string;
  name: string;
}

export default function IDCards() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await crudRequest<Course[]>(
          "GET",
          "/course/get-course"
        );
        setCourses(response as Course[]);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students by course
  const fetchStudentsByCourse = async (courseId: string) => {
    setLoading(true);
    try {
      const response = await crudRequest<Student[]>(
        "GET",
        `/student/get-students-by-course/${courseId}`
      );
      setStudents(response);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    fetchStudentsByCourse(courseId);
  };

  // Handle bulk export
  const handleExport = () => {
    // Implementation for bulk PDF export
    // You can use html2pdf or similar library
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bulk ID Card Generator</h1>
        {students.length > 0 && (
          <Button onClick={handleExport}>Export All Cards</Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <div key={student._id} className="p-4 border rounded-lg"></div>
          ))}
        </div>
      )}
    </div>
  );
}
