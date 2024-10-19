import Heading from "@/components/shared/heading";
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
import { toast } from "react-toastify";

const VisitStudentCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    studentName: "",
    studentNumber: "",
    schoolName: "",
    address: "",
    gender: "",
    courses: [],
  });
  const [coursesData, setCourseData] = useState<Courses[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourses((prevSelectedCourses) => {
      const isSelected = prevSelectedCourses.includes(courseId);
      const newSelectedCourses = isSelected
        ? prevSelectedCourses.filter((_id) => _id !== courseId)
        : [...prevSelectedCourses, courseId];

      // Update selected subjects based on the new selection of courses
      const newSubjects = coursesData
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

  //fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await crudRequest<Courses[]>(
          "GET",
          "/course/get-course"
        );
        if (response && Array.isArray(response)) {
          setCourseData(response);
        } else {
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchCourses();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
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

    await crudRequest("POST", "/visit/add-visit", updatedFormData)
      .then(() => {
        toast.success("Student added successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => {
        toast.error("Failed to add student");
      });
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New Visit Student"}
        description={""}
        className="py-4 space-y-2 text-center"
      />
      <form className="space-y-4" autoComplete="off">
        {/* first step */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 uppercase gap-x-8 gap-y-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={formData.studentName}
                  onChange={(e) => handleChange("studentName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="studentNumber">Student Number</Label>
                <Input
                  id="studentNumber"
                  placeholder="Enter student number"
                  value={formData.studentNumber}
                  onChange={(e) =>
                    handleChange("studentNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="address">Student Address</Label>
                <Input
                  id="address"
                  placeholder="Enter student address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  placeholder="Enter student school name"
                  value={formData.schoolName}
                  onChange={(e) => handleChange("schoolName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Select Gender</Label>
                <Select
                  onValueChange={(value) => handleChange("gender", value)}
                  value={formData.gender}
                >
                  <SelectTrigger
                    id="gender"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* courses */}
              <div className="col-span-2 gap-10">
                <Label htmlFor="courses" className="mb-4">
                  Select Courses
                </Label>
                <div className="grid grid-cols-4 gap-x-10 gap-y-6">
                  {coursesData &&
                    coursesData.map((course, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2 py-2">
                          <Checkbox
                            id={course._id}
                            checked={selectedCourses.includes(course._id)}
                            onCheckedChange={() =>
                              handleCourseChange(course._id)
                            }
                          />
                          <Label htmlFor={course._id}>{course.name}</Label>
                        </div>

                        {selectedCourses.includes(course._id) && (
                          <div className="pl-6 space-y-2">
                            {course.subjects.map((subject) => (
                              <div key={subject._id}>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={subject._id}
                                    checked={selectedSubjects.includes(
                                      subject._id
                                    )}
                                    onCheckedChange={() =>
                                      handleSubjectChange(subject._id)
                                    }
                                  />
                                  <Label htmlFor={subject._id}>
                                    {subject.subjectName}
                                  </Label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* second step */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"></div>
          </>
        )}

        {/* third step */}
        {step === 3 && <></>}

        {/* footer button */}
        <div className="grid justify-between grid-cols-2 gap-4">
          {step === 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full max-w-40"
                size="lg"
                onClick={modalClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full max-w-40"
                size="lg"
                onClick={onSubmit}
              >
                Submit
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default VisitStudentCreateForm;
