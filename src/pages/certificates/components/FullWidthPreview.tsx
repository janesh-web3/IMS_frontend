import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Printer,
  X
} from "lucide-react";

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
    backgroundColor?: string;
    borderColor?: string;
    headerStyle?: string;
  };
}


const FullWidthPreview = ({ 
  certificate, 
  onClose 
}: { certificate: Certificate; onClose: () => void }) => {
  const [zoom, setZoom] = useState(0.8);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => setZoom(0.8);
  const handleFitToScreen = () => setZoom(0.6);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/certificate/${certificate._id}/generate-pdf`,
        {
          headers: {
            Authorization: sessionStorage.getItem("token") || "",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Enhanced filename with student name and date
        const studentName = certificate.student.personalInfo.studentName.replace(/[^a-zA-Z0-9]/g, '_');
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `${studentName}_${certificate.certificateType}_${dateStr}.pdf`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Certificate downloaded successfully");
      } else {
        toast.error("Failed to download certificate");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Failed to download certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const getThemeStyles = () => {
    const { theme, primaryColor, backgroundColor } = certificate.layout;
    
    const baseStyles = {
      backgroundColor: backgroundColor || "#ffffff",
      borderColor: certificate.layout.borderColor || primaryColor,
      color: primaryColor
    };

    switch (theme) {
      case "modern":
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${backgroundColor || "#f8fafc"} 0%, ${backgroundColor || "#ffffff"} 100%)`,
        };
      case "elegant":
        return {
          ...baseStyles,
          background: `radial-gradient(ellipse at center, ${backgroundColor || "#fffbeb"} 0%, ${backgroundColor || "#fef3c7"} 100%)`,
        };
      case "professional":
        return {
          ...baseStyles,
          background: `linear-gradient(to bottom, ${backgroundColor || "#f9fafb"} 0%, ${backgroundColor || "#ffffff"} 100%)`,
        };
      default:
        return baseStyles;
    }
  };

  const renderCertificateContent = () => {
    const { theme, fontFamily } = certificate.layout;

    return (
      <div 
        className="certificate-content w-full h-full p-8 relative"
        style={{
          fontFamily: fontFamily === "Times-Roman" ? "serif" : fontFamily === "Helvetica" ? "sans-serif" : "monospace",
          ...getThemeStyles()
        }}
      >
        {/* Template-specific rendering */}
        {theme === "classic" && renderClassicTemplate()}
        {theme === "modern" && renderModernTemplate()}
        {theme === "elegant" && renderElegantTemplate()}
        {theme === "professional" && renderProfessionalTemplate()}
      </div>
    );
  };

  const renderClassicTemplate = () => {
    const { primaryColor, secondaryColor, instituteName, instituteAddress } = certificate.layout;
    
    return (
      <div className="relative h-full border-4 border-double p-8" style={{ borderColor: primaryColor }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            {instituteName}
          </h1>
          <p className="text-lg" style={{ color: primaryColor }}>
            {instituteAddress}
          </p>
          <div className="w-32 h-1 mx-auto mt-4" style={{ backgroundColor: secondaryColor }}></div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold" style={{ color: secondaryColor }}>
            {certificate.title}
          </h2>
        </div>

        {/* Certificate Content */}
        {renderCertificateBody()}

        {/* Footer */}
        <div className="absolute bottom-8 right-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 w-48">
              <p className="text-sm font-semibold">Authorized Signature</p>
              <p className="text-xs">Director/Principal</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderModernTemplate = () => {
    const { primaryColor, secondaryColor, instituteName, instituteAddress } = certificate.layout;
    
    return (
      <div className="relative h-full">
        {/* Modern Header */}
        <div 
          className="h-24 flex items-center justify-center text-white mb-4"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold">{instituteName}</h1>
            <p className="text-sm opacity-90">{instituteAddress}</p>
          </div>
        </div>
        
        {/* Accent bar */}
        <div className="h-2 mb-8" style={{ backgroundColor: secondaryColor }}></div>

        {/* Content */}
        <div className="px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold" style={{ color: primaryColor }}>
              {certificate.title}
            </h2>
            <div className="w-48 h-1 mx-auto mt-4" style={{ backgroundColor: secondaryColor }}></div>
          </div>

          {renderCertificateBody()}
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 right-8">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 w-48">
              <p className="text-sm font-semibold">Digital Signature</p>
              <p className="text-xs">Principal</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderElegantTemplate = () => {
    const { primaryColor, secondaryColor, instituteName, instituteAddress } = certificate.layout;
    
    return (
      <div className="relative h-full border-2 p-8" style={{ borderColor: primaryColor }}>
        {/* Elegant corners */}
        <div className="absolute top-2 left-2 w-4 h-4" style={{ backgroundColor: secondaryColor }}></div>
        <div className="absolute top-2 right-2 w-4 h-4" style={{ backgroundColor: secondaryColor }}></div>
        <div className="absolute bottom-2 left-2 w-4 h-4" style={{ backgroundColor: secondaryColor }}></div>
        <div className="absolute bottom-2 right-2 w-4 h-4" style={{ backgroundColor: secondaryColor }}></div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            {instituteName}
          </h1>
          <p className="text-lg" style={{ color: primaryColor }}>
            {instituteAddress}
          </p>
          <div className="text-2xl my-4" style={{ color: secondaryColor }}>
            ◆ ◆ ◆
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold" style={{ color: secondaryColor }}>
            {certificate.title}
          </h2>
          <div className="text-xl mt-4" style={{ color: primaryColor }}>
            ◆ ◆ ◆
          </div>
        </div>

        {renderCertificateBody()}

        {/* Footer */}
        <div className="absolute bottom-8 right-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 w-48">
              <p className="text-sm font-semibold">Official Seal</p>
              <p className="text-xs">Principal</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfessionalTemplate = () => {
    const { primaryColor, secondaryColor, instituteName, instituteAddress } = certificate.layout;
    
    return (
      <div className="relative h-full">
        {/* Professional Header */}
        <div className="bg-gray-50 p-6 border-b-4 mb-8" style={{ borderColor: primaryColor }}>
          <div className="flex items-center">
            <div className="w-16 h-16 border-2 border-gray-300 mr-6 flex items-center justify-center">
              <span className="text-xs text-gray-500">LOGO</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
                {instituteName}
              </h1>
              <p className="text-gray-600">{instituteAddress}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold" style={{ color: secondaryColor }}>
              {certificate.title}
            </h2>
            <div className="w-full h-px bg-gray-300 mt-6"></div>
          </div>

          {renderCertificateBody()}
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 right-8">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 w-48">
              <p className="text-sm font-semibold">Authorized By</p>
              <p className="text-xs">Academic Director</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificateBody = () => {
    const { primaryColor, secondaryColor } = certificate.layout;
    const student = certificate.student;

    return (
      <div className="text-center space-y-6">
        {/* Certificate Info */}
        <div className="flex justify-between text-sm text-gray-600 mb-8">
          <span>Certificate No: {certificate.certificateNumber}</span>
          <span>Issue Date: {new Date(certificate.issueDate).toLocaleDateString()}</span>
        </div>

        {/* Student Info */}
        <div className="space-y-4">
          <p className="text-xl" style={{ color: primaryColor }}>
            This is to certify that
          </p>
          <h3 className="text-3xl font-bold" style={{ color: secondaryColor }}>
            {student.personalInfo.studentName}
          </h3>
          <div className="space-y-2">
            <p className="text-lg" style={{ color: primaryColor }}>
              Admission No: {student.personalInfo.admissionNumber}
            </p>
            <p className="text-lg" style={{ color: primaryColor }}>
              Course: {certificate.course.name}
            </p>
          </div>
        </div>

        {/* Certificate/Marksheet Content */}
        {certificate.certificateType === "marksheet" ? (
          <div className="mt-8">
            <p className="text-lg mb-6" style={{ color: primaryColor }}>
              has successfully completed the examination with the following results:
            </p>
            
            {/* Subjects Table */}
            <div className="max-w-2xl mx-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">Subject</th>
                    <th className="border border-gray-300 p-3">Max Marks</th>
                    <th className="border border-gray-300 p-3">Obtained</th>
                    <th className="border border-gray-300 p-3">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {certificate.subjects?.map((subject, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-3">{subject.subject.subjectName}</td>
                      <td className="border border-gray-300 p-3 text-center">{subject.maxMarks}</td>
                      <td className="border border-gray-300 p-3 text-center">{subject.marks}</td>
                      <td className="border border-gray-300 p-3 text-center">{subject.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-gray-300 p-3">Total</td>
                    <td className="border border-gray-300 p-3 text-center">{certificate.totalMarks}</td>
                    <td className="border border-gray-300 p-3 text-center">{certificate.obtainedMarks}</td>
                    <td className="border border-gray-300 p-3 text-center">{certificate.grade}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-4 text-lg font-semibold" style={{ color: primaryColor }}>
                <p>Percentage: {certificate.percentage.toFixed(2)}%</p>
                <p>Overall Grade: {certificate.grade}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-xl" style={{ color: primaryColor }}>
              has successfully completed the {certificate.course.name} course
            </p>
            <p className="text-xl" style={{ color: primaryColor }}>
              with an overall grade of <span className="font-bold">{certificate.grade}</span>
            </p>
            <p className="text-xl" style={{ color: primaryColor }}>
              and percentage of <span className="font-bold">{certificate.percentage.toFixed(2)}%</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            {certificate.certificateType === "certificate" ? "Certificate" : "Marksheet"} Preview
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitToScreen}>
              Fit Screen
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area - Full viewport with proper scrolling */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="min-h-full flex items-center justify-center p-4">
          <div 
            ref={previewRef}
            className="bg-white shadow-2xl transition-transform duration-200 max-w-none"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              width: '210mm',  // A4 width
              minHeight: '297mm', // A4 height
              aspectRatio: '210/297'
            }}
          >
            {renderCertificateContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullWidthPreview;
