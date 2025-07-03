import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Award, Calendar, User, GraduationCap } from "lucide-react";

interface Certificate {
  _id: string;
  student: {
    personalInfo: {
      studentName: string;
      admissionNumber: string;
    };
  };
  course: {
    name: string;
  };
  certificateType: "certificate" | "marksheet";
  title: string;
  description: string;
  certificateNumber: string;
  percentage: number;
  grade: string;
  issueDate: string;
  status: string;
  subjects?: Array<{
    subject: {
      subjectName: string;
    };
    marks: number;
    maxMarks: number;
    grade: string;
  }>;
  totalMarks?: number;
  obtainedMarks?: number;
  layout: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    instituteName: string;
    instituteAddress: string;
  };
}

interface CertificatePreviewProps {
  certificate: Certificate;
  onDownload: () => void;
  onClose: () => void;
}

const CertificatePreview = ({ certificate, onDownload, onClose }: CertificatePreviewProps) => {
  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {certificate.certificateType === "certificate" ? (
            <Award className="h-6 w-6 text-blue-600" />
          ) : (
            <FileText className="h-6 w-6 text-green-600" />
          )}
          <div>
            <h2 className="text-xl font-semibold">{certificate.title}</h2>
            <p className="text-sm text-gray-500">Certificate #{certificate.certificateNumber}</p>
          </div>
        </div>
        <Badge
          variant={certificate.status === "issued" ? "default" : "outline"}
        >
          {certificate.status}
        </Badge>
      </div>

      {/* Certificate Preview */}
      <Card className="border-2" style={{ borderColor: certificate.layout.primaryColor }}>
        <CardHeader 
          className="text-center"
          style={{ backgroundColor: `${certificate.layout.primaryColor}10` }}
        >
          <div className="text-center space-y-2">
            <h1 
              className="text-2xl font-bold"
              style={{ color: certificate.layout.primaryColor }}
            >
              {certificate.layout.instituteName}
            </h1>
            <p className="text-sm text-gray-600">{certificate.layout.instituteAddress}</p>
            <div 
              className="text-3xl font-bold mt-4"
              style={{ color: certificate.layout.secondaryColor }}
            >
              {certificate.title}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {/* Student Info */}
          <div className="text-center space-y-2">
            <p className="text-lg">This is to certify that</p>
            <h2 
              className="text-2xl font-bold"
              style={{ color: certificate.layout.secondaryColor }}
            >
              {certificate.student.personalInfo.studentName}
            </h2>
            <p className="text-sm text-gray-600">
              Admission No: {certificate.student.personalInfo.admissionNumber}
            </p>
            <p className="text-sm text-gray-600">
              Course: {certificate.course.name}
            </p>
          </div>

          {/* Certificate Content */}
          {certificate.certificateType === "certificate" ? (
            <div className="text-center space-y-4">
              <p>has successfully completed the {certificate.course.name} course</p>
              <p>with an overall grade of <strong>{certificate.grade}</strong></p>
              <p>and percentage of <strong>{certificate.percentage.toFixed(2)}%</strong></p>
              {certificate.description && (
                <p className="text-sm text-gray-600 italic">{certificate.description}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center">has successfully completed the examination with the following results:</p>
              
              {/* Subjects Table */}
              {certificate.subjects && certificate.subjects.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Subject</th>
                        <th className="border border-gray-300 p-2 text-center">Max Marks</th>
                        <th className="border border-gray-300 p-2 text-center">Obtained</th>
                        <th className="border border-gray-300 p-2 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificate.subjects.map((subject, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{subject.subject.subjectName}</td>
                          <td className="border border-gray-300 p-2 text-center">{subject.maxMarks}</td>
                          <td className="border border-gray-300 p-2 text-center">{subject.marks}</td>
                          <td className="border border-gray-300 p-2 text-center">{subject.grade}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="border border-gray-300 p-2">Total</td>
                        <td className="border border-gray-300 p-2 text-center">{certificate.totalMarks}</td>
                        <td className="border border-gray-300 p-2 text-center">{certificate.obtainedMarks}</td>
                        <td className="border border-gray-300 p-2 text-center">{certificate.grade}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="text-center space-y-2">
                <p><strong>Percentage:</strong> {certificate.percentage.toFixed(2)}%</p>
                <p><strong>Overall Grade:</strong> {certificate.grade}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-end pt-8">
            <div className="text-sm text-gray-600">
              <p>Issue Date: {new Date(certificate.issueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-8 w-32">
                <p className="text-sm">Authorized Signature</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Student Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {certificate.student.personalInfo.studentName}</p>
            <p><strong>Admission No:</strong> {certificate.student.personalInfo.admissionNumber}</p>
            <p><strong>Course:</strong> {certificate.course.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Type:</strong> {certificate.certificateType}</p>
            <p><strong>Grade:</strong> {certificate.grade}</p>
            <p><strong>Percentage:</strong> {certificate.percentage.toFixed(2)}%</p>
            <p><strong>Status:</strong> {certificate.status}</p>
          </CardContent>
        </Card>
      </div>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p><strong>Theme:</strong> {certificate.layout.theme}</p>
            </div>
            <div>
              <p><strong>Font:</strong> {certificate.layout.fontFamily}</p>
            </div>
            <div className="flex items-center gap-2">
              <strong>Primary:</strong>
              <div
                className="w-4 h-4 border rounded"
                style={{ backgroundColor: certificate.layout.primaryColor }}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <strong>Secondary:</strong>
              <div
                className="w-4 h-4 border rounded"
                style={{ backgroundColor: certificate.layout.secondaryColor }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default CertificatePreview;
