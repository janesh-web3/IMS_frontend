import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAdminContext } from "@/context/adminContext";
import { Student } from "@/types";

const PersonalDashboard = () => {
  const { adminDetails } = useAdminContext();

  if (adminDetails.role !== "student") {
    return <div className="mt-10 text-center text-red-500">Access Denied</div>;
  }

  const { personalInfo, courses } = adminDetails.user as Student;

  return (
    <div className="container p-4 mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="py-4 text-center text-foreground bg-primary">
          <h2 className="text-2xl font-semibold">Personal Information</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <p>
              <strong>Name:</strong> {personalInfo.studentName}
            </p>
            <p>
              <strong>Address:</strong> {personalInfo.address}
            </p>
            <p>
              <strong>Contact Number:</strong> {personalInfo.contactNo}
            </p>
            <p>
              <strong>Date of birth:</strong> {personalInfo.dateOfBirth}
            </p>
            <p>
              <strong>Gender:</strong> {personalInfo.gender}
            </p>
            <p>
              <strong>Guardian Contact:</strong> {personalInfo.guardianContact}
            </p>
            <p>
              <strong>Guardian Name:</strong> {personalInfo.guardianName}
            </p>
            <p>
              <strong>Local Guardian Contact:</strong>{" "}
              {personalInfo.localGuardianContact}
            </p>
            <p>
              <strong>Local Guardian Name:</strong>{" "}
              {personalInfo.localGuardianName}
            </p>
            <p>
              <strong>Payment Deadline:</strong> {personalInfo.paymentDeadline}
            </p>
            <p>
              <strong>Referred By:</strong> {personalInfo.referredBy}
            </p>
            <p>
              <strong>School Name:</strong> {personalInfo.schoolName}
            </p>
            <p>
              <strong>Admission Number:</strong> {personalInfo.admissionNumber}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-lg">
        <CardHeader className="py-4 text-center text-foreground bg-primary">
          <h2 className="text-2xl font-semibold">Courses Information</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course._id}>
                <p>
                  <strong>Course Name:</strong> {course.courseEnroll.name}
                </p>
                <p>
                  <strong>Subjects:</strong>{" "}
                  {course.subjectsEnroll.map(
                    (subject) => subject.subjectName.subjectName
                  )}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDashboard;
