import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { crudRequest } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

type Courses = {
  courseEnroll: {
    name: string;
    _id: string;
  };
  subjectsEnroll: {
    subjectName: {
      _id: string;
      subjectName: string;
    };
  }[];
};

type CourseResponse = {
  _id: string;
  name: string;
  percentage: string;
  monthlySalary: number;
  courses: Courses[];
};

const TeacherUpdateForm = ({ id }: { id: string }) => {
  const [courses, setCourses] = useState<
    {
      _id: string;
      name: string;
      subjects: { _id: string; subjectName: string }[];
    }[]
  >([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Form field states
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [percentage, setPercentage] = useState("");
  const [monthlySalary, setMonthlySalary] = useState<number | "">(0);

  const fetchCourses = async () => {
    try {
      const response = await crudRequest<
        {
          _id: string;
          name: string;
          subjects: { _id: string; subjectName: string }[];
        }[]
      >("GET", "/course/get-course");
      setCourses(response);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchTeacher = () => {
      crudRequest<CourseResponse>("GET", `/faculty/get-faculty/${id}`).then(
        (response) => {
          setName(response.name);
          setPercentage(response.percentage);
          setMonthlySalary(response.monthlySalary);
          //   setSelectedCourses(response.courses);

          const courseIds = response.courses.map(
            (course) => course.courseEnroll._id
          );
          const subjectIds = response.courses.flatMap((course) =>
            course.subjectsEnroll.map((subject) => subject.subjectName._id)
          );

          setSelectedCourses(courseIds);
          setSelectedSubjects(subjectIds);
        }
      );
    };
    fetchTeacher();
  }, [id]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourses((prevSelectedCourses) => {
      const isSelected = prevSelectedCourses.includes(courseId);
      const newSelectedCourses = isSelected
        ? prevSelectedCourses.filter((_id) => _id !== courseId)
        : [...prevSelectedCourses, courseId];

      // Update selected subjects based on the new selection of courses
      const newSubjects = courses
        .filter((course) => newSelectedCourses.includes(course._id))
        .flatMap((course) => course.subjects.map((subject) => subject._id));

      // Remove subjects not in the newly selected courses
      const updatedSubjects = selectedSubjects.filter((subjectId) =>
        newSubjects.includes(subjectId)
      );

      setSelectedSubjects(updatedSubjects);

      return newSelectedCourses;
    });
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjects((prevSelectedSubjects) =>
      prevSelectedSubjects.includes(subjectId)
        ? prevSelectedSubjects.filter((_id) => _id !== subjectId)
        : [...prevSelectedSubjects, subjectId]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedCourses = selectedCourses.map((courseId) => ({
      courseEnroll: courseId,
      subjectsEnroll:
        courses
          .find((course) => course._id === courseId)
          ?.subjects.filter((subject) => selectedSubjects.includes(subject._id))
          .map((subject) => ({
            subjectName: subject._id,
          })) || [],
    }));

    const formData = {
      name,
      contactNo,
      percentage,
      monthlySalary,
      courses: formattedCourses,
    };

    await crudRequest("PUT", `/faculty/update-faculty/${id}`, formData)
      .then(() => {
        toast.success("Teacher updated successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        console.error("Error updating teacher:", err);
        toast.error("Failed to updating teacher");
      });
  };

  return (
    <div className="px-2 py-2">
      <form className="space-y-4" autoComplete="off">
        <div>
          <div className="grid grid-cols-1 overflow-auto gap-x-8 gap-y-4">
            <div>
              <Label htmlFor="name">Teacher Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="contactNo">Teacher Number</Label>
              <Input
                id="contactNo"
                placeholder="Enter contact number"
                value={contactNo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setContactNo(e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="percentage">Teacher Percentage</Label>
              <Input
                id="percentage"
                placeholder="Enter percentage"
                value={percentage}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPercentage(e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="monthlySalary">Teacher Salary</Label>
              <Input
                id="monthlySalary"
                placeholder="Enter monthly salary"
                type="number"
                value={monthlySalary}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setMonthlySalary(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Select Courses</Label>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {courses.map((course) => (
                <div key={course._id} className="items-center space-x-3">
                  <Checkbox
                    id={course._id}
                    checked={selectedCourses.includes(course._id)}
                    onCheckedChange={() => handleCourseChange(course._id)}
                  />
                  <Label htmlFor={course._id}>{course.name}</Label>
                  {selectedCourses.includes(course._id) && (
                    <div className="items-center justify-center pl-6 space-y-2">
                      {course.subjects.map((subject) => (
                        <div
                          key={subject._id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={subject._id}
                            checked={selectedSubjects.includes(subject._id)}
                            onCheckedChange={() =>
                              handleSubjectChange(subject._id)
                            }
                          />
                          <Label htmlFor={subject._id}>
                            {subject.subjectName}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid justify-between grid-cols-2 gap-4">
          <Button
            type="button"
            className="rounded-full max-w-40"
            size="lg"
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeacherUpdateForm;
