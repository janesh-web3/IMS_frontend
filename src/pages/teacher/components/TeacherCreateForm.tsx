import Heading from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { crudRequest } from "@/lib/api";
import { Input } from "@/components/ui/input";

const TeacherCreateForm = ({ modalClose }: { modalClose: () => void }) => {
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    await crudRequest("POST", "/faculty/add-faculty", formData).then(() => {
      alert("Faculty added successfully");
      window.location.reload();
    });
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New Teacher"}
        description={""}
        className="py-4 space-y-2 text-center"
      />
      <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
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
              <div key={course._id}>
                <Checkbox
                  id={course._id}
                  checked={selectedCourses.includes(course._id)}
                  onCheckedChange={() => handleCourseChange(course._id)}
                />
                <Label htmlFor={course._id}>{course.name}</Label>
                {selectedCourses.includes(course._id) && (
                  <div className="pl-6 space-y-2">
                    {course.subjects.map((subject) => (
                      <div key={subject._id}>
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

        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            size="lg"
            onClick={modalClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="rounded-full" size="lg">
            Create Teacher
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeacherCreateForm;
