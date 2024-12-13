import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crudRequest } from "@/lib/api";
import { Courses } from "@/types";
import { useEffect, useState } from "react";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialData?: {
    _id: string;
    studentName: string;
    studentNumber: string;
    schoolName: string;
    address: string;
    gender: string;
    courses: Array<{
      courseEnroll: { _id: string; name: string };
      subjectsEnroll: Array<{
        subjectName: { _id: string; subjectName: string };
      }>;
    }>;
  };
}

export function UpdateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UpdateModalProps) {
  const [formData, setFormData] = useState<{
    studentName: string;
    studentNumber: string;
    schoolName: string;
    address: string;
    gender: string;
    courses: Array<{
      courseEnroll: { _id: string; name: string };
      subjectsEnroll: Array<{
        subjectName: { _id: string; subjectName: string };
      }>;
    }>;
  }>({
    studentName: initialData?.studentName || "",
    studentNumber: initialData?.studentNumber || "",
    schoolName: initialData?.schoolName || "",
    address: initialData?.address || "",
    gender: initialData?.gender || "",
    courses: [],
  });
  const [coursesData, setCourseData] = useState<Courses[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentName: initialData.studentName,
        studentNumber: initialData.studentNumber,
        schoolName: initialData.schoolName,
        address: initialData.address,
        gender: initialData.gender,
        courses: initialData.courses,
      });

      // Set selected courses and subjects from initialData
      setSelectedCourses(
        initialData.courses.map((course) => course.courseEnroll._id)
      );
      setSelectedSubjects(
        initialData.courses.flatMap((course) =>
          course.subjectsEnroll.map((subject) => subject.subjectName._id)
        )
      );
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await crudRequest<Courses[]>(
          "GET",
          "/course/get-course"
        );
        if (response && Array.isArray(response)) {
          setCourseData(response);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourses((prev) => {
      const isSelected = prev.includes(courseId);
      const newSelected = isSelected
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];

      // Update subjects when courses change
      const newSubjects = coursesData
        .filter((course) => newSelected.includes(course._id))
        .flatMap((course) => course.subjects.map((subject) => subject._id));

      setSelectedSubjects((prev) =>
        prev.filter((id) => newSubjects.includes(id))
      );

      return newSelected;
    });
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      courses: coursesData
        .filter((course) => selectedCourses.includes(course._id))
        .map((course) => ({
          courseEnroll: course._id,
          subjectsEnroll: course.subjects
            .filter((subject) => selectedSubjects.includes(subject._id))
            .map((subject) => ({
              subjectName: subject._id,
            })),
        })),
    };
    onSubmit(updatedFormData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Update Visit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => handleChange("studentName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="studentNumber">Student Number</Label>
              <Input
                id="studentNumber"
                value={formData.studentNumber}
                onChange={(e) => handleChange("studentNumber", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleChange("schoolName", e.target.value)}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Courses</Label>
            <div className="grid grid-cols-2 gap-4">
              {coursesData.map((course) => (
                <div key={course._id}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCourses.includes(course._id)}
                      onCheckedChange={() => handleCourseChange(course._id)}
                    />
                    <Label>{course.name}</Label>
                  </div>
                  {selectedCourses.includes(course._id) && (
                    <div className="pl-6 space-y-2">
                      {course.subjects.map((subject) => (
                        <div
                          key={subject._id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={selectedSubjects.includes(subject._id)}
                            onCheckedChange={() =>
                              handleSubjectChange(subject._id)
                            }
                          />
                          <Label>{subject.subjectName}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
