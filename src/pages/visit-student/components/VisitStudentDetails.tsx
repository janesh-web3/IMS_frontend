import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import React from "react";

type SubjectEnroll = {
  subjectName: {
    subjectName: string;
  };
  _id: string;
};

type StudentCourse = {
  courseEnroll: {
    name: string;
    _id: string;
  };
  subjectsEnroll: SubjectEnroll[];
  _id: string;
};

type VisitStudent = {
  _id: string;
  studentName: string;
  studentNumber: string;
  address: string;
  gender: string;
  dateOfVisit: string;
  courses: StudentCourse[];
  photo?: string;
  schoolName: string;
};

const VisitStudentDetails: React.FC<VisitStudent> = ({
  studentName,
  studentNumber,
  address,
  gender,
  courses,
  schoolName,
}) => {
  return (
    <div>
      <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="flex items-center gap-2 text-lg group">
              {studentName}
            </CardTitle>
            <CardDescription>{schoolName}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <Separator className="my-4" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="grid gap-3">
              <div className="font-semibold">Personal Details</div>
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span>{gender}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contact Us </span>
                  <span>{studentNumber}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Address </span>
                  <span>{address}</span>
                </li>
              </ul>
            </div>

            <div className="grid gap-3 auto-rows-max">
              <div className="font-semibold">Courses Details</div>
              <ul>
                {courses &&
                  courses.map((course, index) => (
                    <li key={index}>
                      <h2 className="font-semibold">
                        <span className="text-muted-foreground">
                          Course Name : &nbsp;
                        </span>
                        <span>{course.courseEnroll.name}</span>
                      </h2>
                      <ul className="grid gap-3">
                        {course.subjectsEnroll.map((subject) => (
                          <div key={subject._id}>
                            <li className="flex items-center justify-between">
                              <h3>
                                <span className="text-muted-foreground">
                                  Subject Name : &nbsp;
                                </span>
                                <span>{subject.subjectName.subjectName}</span>
                              </h3>
                            </li>

                            <Separator className="my-2" />
                          </div>
                        ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitStudentDetails;
