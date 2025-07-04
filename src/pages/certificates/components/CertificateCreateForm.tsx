import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";

interface Student {
  _id: string;
  personalInfo: {
    studentName: string;
    admissionNumber: string;
  };
}

interface Course {
  _id: string;
  name: string;
  subjects: Subject[];
}

interface Subject {
  _id: string;
  subjectName: string;
}

interface SubjectMark {
  subject: string;
  marks: number;
  maxMarks: number;
}

interface CertificateCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CertificateCreateForm = ({ onSuccess, onCancel }: CertificateCreateFormProps) => {
  const [formData, setFormData] = useState({
    studentId: "",
    certificateType: "certificate" as "certificate" | "marksheet",
    title: "",
    description: "",
    courseId: "",
    layout: {
      theme: "classic",
      primaryColor: "#1f2937",
      secondaryColor: "#3b82f6",
      fontFamily: "Times-Roman",
      instituteName: "Our Institute",
      instituteAddress: "Institute Address",
    },
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      const course = courses.find(c => c._id === formData.courseId);
      setSelectedCourse(course || null);
      if (course) {
        setSubjectMarks(
          course.subjects.map(subject => ({
            subject: subject._id,
            marks: 0,
            maxMarks: 100,
          }))
        );
      }
    }
  }, [formData.courseId, courses]);

  const fetchStudents = async () => {
    try {
      const response = await crudRequest<Student[]>("GET", "/student/get-student");
      if (Array.isArray(response)) {
        setStudents(response);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await crudRequest<Course[]>("GET", "/course/get-course");
      if (Array.isArray(response)) {
        setCourses(response);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLayoutChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      layout: { ...prev.layout, [name]: value }
    }));
  };

  const handleSubjectMarkChange = (index: number, field: "marks" | "maxMarks", value: number) => {
    setSubjectMarks(prev => 
      prev.map((mark, i) => 
        i === index ? { ...mark, [field]: value } : mark
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.courseId || !formData.title) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.certificateType === "marksheet" && subjectMarks.length === 0) {
      toast.error("Please add subject marks for marksheet");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        subjects: formData.certificateType === "marksheet" ? subjectMarks : [],
      };

      await crudRequest("POST", "/certificate/create", payload);
      toast.success("Certificate created successfully");
      onSuccess();
    } catch (error) {
      console.error("Error creating certificate:", error);
      toast.error("Failed to create certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Student *</Label>
              <Select value={formData.studentId} onValueChange={(value) => handleInputChange("studentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.personalInfo.studentName} ({student.personalInfo.admissionNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="certificateType">Type *</Label>
              <Select 
                value={formData.certificateType} 
                onValueChange={(value: "certificate" | "marksheet") => handleInputChange("certificateType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="marksheet">Marksheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course">Course *</Label>
              <Select value={formData.courseId} onValueChange={(value) => handleInputChange("courseId", value)}>
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

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Certificate/Marksheet Title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Certificate description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subject Marks (only for marksheet) */}
      {formData.certificateType === "marksheet" && selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectMarks.map((mark, index) => {
                const subject = selectedCourse.subjects.find(s => s._id === mark.subject);
                return (
                  <div key={mark.subject} className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <Label>{subject?.subjectName}</Label>
                    </div>
                    <div>
                      <Label>Obtained Marks</Label>
                      <Input
                        type="number"
                        value={mark.marks}
                        onChange={(e) => handleSubjectMarkChange(index, "marks", parseInt(e.target.value) || 0)}
                        placeholder="Marks"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Max Marks</Label>
                      <Input
                        type="number"
                        value={mark.maxMarks}
                        onChange={(e) => handleSubjectMarkChange(index, "maxMarks", parseInt(e.target.value) || 100)}
                        placeholder="Max Marks"
                        min="1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={formData.layout.theme} onValueChange={(value) => handleLayoutChange("theme", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={formData.layout.fontFamily} onValueChange={(value) => handleLayoutChange("fontFamily", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Times-Roman">Times Roman</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                type="color"
                value={formData.layout.primaryColor}
                onChange={(e) => handleLayoutChange("primaryColor", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <Input
                type="color"
                value={formData.layout.secondaryColor}
                onChange={(e) => handleLayoutChange("secondaryColor", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="instituteName">Institute Name</Label>
              <Input
                value={formData.layout.instituteName}
                onChange={(e) => handleLayoutChange("instituteName", e.target.value)}
                placeholder="Institute Name"
              />
            </div>

            <div>
              <Label htmlFor="instituteAddress">Institute Address</Label>
              <Input
                value={formData.layout.instituteAddress}
                onChange={(e) => handleLayoutChange("instituteAddress", e.target.value)}
                placeholder="Institute Address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Certificate"}
        </Button>
      </div>
    </form>
  );
};

export default CertificateCreateForm;
