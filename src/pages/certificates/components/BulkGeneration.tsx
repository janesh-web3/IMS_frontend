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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { Users, GraduationCap, BookOpen, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import TemplateSelector from "./TemplateSelector";

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

interface Template {
  name: string;
  displayName: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  instituteName: string;
  instituteAddress: string;
  backgroundColor: string;
  borderColor: string;
  headerStyle: string;
}

interface BulkGenerationResult {
  successful: Array<{
    studentId: string;
    studentName: string;
    certificateId: string;
    certificateNumber: string;
  }>;
  failed: Array<{
    studentId: string;
    studentName: string;
    error: string;
  }>;
  total: number;
}

interface BulkGenerationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BulkGeneration = ({ onSuccess, onCancel }: BulkGenerationProps) => {
  const [formData, setFormData] = useState({
    certificateType: "certificate" as "certificate" | "marksheet",
    title: "",
    description: "",
    courseId: "",
    studentSelection: "all" as "all" | "course" | "subject" | "custom",
    selectedStudents: [] as string[],
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<BulkGenerationResult | null>(null);
  const [step, setStep] = useState(1); // 1: Setup, 2: Template, 3: Preview, 4: Results

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.studentSelection !== "custom") {
      fetchPreviewStudents();
    }
  }, [formData.studentSelection, formData.courseId]);

  const fetchInitialData = async () => {
    try {
      const [coursesResponse, studentsResponse] = await Promise.all([
        crudRequest<Course[]>("GET", "/course/get-course"),
        crudRequest<Student[]>("GET", "/student/get-student")
      ]);

      if (Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
      }
      if (Array.isArray(studentsResponse)) {
        setStudents(studentsResponse);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchPreviewStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("type", formData.studentSelection);
      
      if (formData.courseId) {
        params.append("courseId", formData.courseId);
      }

      const response = await crudRequest<{
        success: boolean;
        data: Student[];
        count: number;
      }>("GET", `/certificate/students-for-bulk?${params.toString()}`);
      
      if (response.success) {
        setPreviewStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching preview students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedTemplate || !formData.title) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setGenerating(true);
      
      const payload = {
        certificateType: formData.certificateType,
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        layout: selectedTemplate,
        studentSelection: formData.studentSelection,
        filters: {
          studentIds: formData.selectedStudents,
        },
        subjects: [] // Add subject marks if needed for marksheets
      };

      const response = await crudRequest<{
        success: boolean;
        data: BulkGenerationResult;
        message: string;
      }>("POST", "/certificate/bulk-generate", payload);

      if (response.success) {
        setResults(response.data);
        setStep(4);
        toast.success(response.message);
      }
    } catch (error) {
      console.error("Error in bulk generation:", error);
      toast.error("Failed to generate certificates");
    } finally {
      setGenerating(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const getSelectionIcon = () => {
    switch (formData.studentSelection) {
      case "all": return <Users className="h-5 w-5" />;
      case "course": return <GraduationCap className="h-5 w-5" />;
      case "subject": return <BookOpen className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderSetupStep();
      case 2:
        return renderTemplateStep();
      case 3:
        return renderPreviewStep();
      case 4:
        return renderResultsStep();
      default:
        return renderSetupStep();
    }
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificateType">Certificate Type *</Label>
              <Select 
                value={formData.certificateType} 
                onValueChange={(value: "certificate" | "marksheet") => 
                  setFormData(prev => ({ ...prev, certificateType: value }))
                }
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Certificate/Marksheet Title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Certificate description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="courseId">Course (Optional)</Label>
            <Select 
              value={formData.courseId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
            >
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.studentSelection === "all" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setFormData(prev => ({ ...prev, studentSelection: "all" }))}
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <div>
                  <div className="font-semibold">All Students</div>
                  <div className="text-sm text-gray-600">Generate for all students</div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.studentSelection === "course" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setFormData(prev => ({ ...prev, studentSelection: "course" }))}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6" />
                <div>
                  <div className="font-semibold">By Course</div>
                  <div className="text-sm text-gray-600">Select specific course</div>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.studentSelection === "custom" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setFormData(prev => ({ ...prev, studentSelection: "custom" }))}
            >
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <div>
                  <div className="font-semibold">Custom Selection</div>
                  <div className="text-sm text-gray-600">Manually select students</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview of selected students */}
          {formData.studentSelection !== "custom" && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                {getSelectionIcon()}
                <span className="font-medium">
                  Preview: {previewStudents.length} students selected
                </span>
              </div>
              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {previewStudents.slice(0, 10).map((student) => (
                    <div key={student._id} className="text-sm py-1">
                      {student.personalInfo.studentName} ({student.personalInfo.admissionNumber})
                    </div>
                  ))}
                  {previewStudents.length > 10 && (
                    <div className="text-sm text-gray-500 py-1">
                      ... and {previewStudents.length - 10} more students
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Custom student selection */}
          {formData.studentSelection === "custom" && (
            <div className="space-y-2">
              <Label>Select Students</Label>
              <div className="max-h-60 overflow-y-auto border rounded p-4 space-y-2">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student._id}
                      checked={formData.selectedStudents.includes(student._id)}
                      onCheckedChange={() => handleStudentToggle(student._id)}
                    />
                    <label htmlFor={student._id} className="text-sm cursor-pointer">
                      {student.personalInfo.studentName} ({student.personalInfo.admissionNumber})
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {formData.selectedStudents.length} students selected
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTemplateStep = () => (
    <TemplateSelector
      selectedTemplate={selectedTemplate}
      onTemplateSelect={setSelectedTemplate}
      onCustomize={(template) => {
        setSelectedTemplate(template);
        // Add customization logic here
      }}
    />
  );

  const renderPreviewStep = () => {
    const totalStudents = formData.studentSelection === "custom" 
      ? formData.selectedStudents.length 
      : previewStudents.length;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Certificate Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {formData.certificateType}</div>
                  <div><strong>Title:</strong> {formData.title}</div>
                  <div><strong>Description:</strong> {formData.description || "None"}</div>
                  <div><strong>Course:</strong> {
                    courses.find(c => c._id === formData.courseId)?.name || "Not specified"
                  }</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Template</h4>
                {selectedTemplate && (
                  <div className="space-y-2 text-sm">
                    <div><strong>Theme:</strong> {selectedTemplate.displayName}</div>
                    <div><strong>Institute:</strong> {selectedTemplate.instituteName}</div>
                    <div><strong>Font:</strong> {selectedTemplate.fontFamily}</div>
                    <div className="flex items-center gap-2">
                      <strong>Colors:</strong>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: selectedTemplate.primaryColor }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: selectedTemplate.secondaryColor }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Students to Generate ({totalStudents})</h4>
              <div className="flex items-center gap-2 text-lg">
                {getSelectionIcon()}
                <span>
                  {formData.studentSelection === "all" && "All Students"}
                  {formData.studentSelection === "course" && `Students in ${courses.find(c => c._id === formData.courseId)?.name || "Selected Course"}`}
                  {formData.studentSelection === "custom" && "Manually Selected Students"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">Important Note</h4>
              <p className="text-sm text-yellow-700">
                This will generate {totalStudents} certificates. This process may take several minutes 
                and cannot be cancelled once started. Please ensure all details are correct.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResultsStep = () => {
    if (!results) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Bulk Generation Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.total}</div>
                <div className="text-sm text-gray-600">Total Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.successful.length}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{results.failed.length}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {results.successful.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-green-700 mb-3">Successfully Generated</h4>
                <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-1">
                  {results.successful.map((item) => (
                    <div key={item.certificateId} className="flex justify-between text-sm">
                      <span>{item.studentName}</span>
                      <Badge variant="outline">{item.certificateNumber}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.failed.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-3">Failed to Generate</h4>
                <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-1">
                  {results.failed.map((item) => (
                    <div key={item.studentId} className="text-sm">
                      <div className="font-medium">{item.studentName}</div>
                      <div className="text-red-600 text-xs">{item.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">
          {step === 1 && "Setup Certificate Configuration"}
          {step === 2 && "Choose Template"}
          {step === 3 && "Review & Generate"}
          {step === 4 && "Generation Results"}
        </h2>
      </div>

      {renderStepContent()}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <div>
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            {step === 4 ? "Close" : "Cancel"}
          </Button>
          
          {step < 3 && (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!formData.title || !formData.certificateType)) ||
                (step === 2 && !selectedTemplate)
              }
            >
              Next
            </Button>
          )}
          
          {step === 3 && (
            <Button 
              onClick={handleBulkGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Certificates"
              )}
            </Button>
          )}
          
          {step === 4 && (
            <Button onClick={onSuccess}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkGeneration;
