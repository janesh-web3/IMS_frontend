import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { crudRequest } from "@/lib/api";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Slider } from "@/components/ui/slider";

interface Theme {
  id: string;
  name: string;
  styles: {
    backgroundColor: string;
    headerTextColor: string;
    textColor: string;
    borderColor: string;
    gradientFrom?: string;
    gradientTo?: string;
    pattern?: string;
  };
}

interface CustomizationOptions {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: {
    header: string;
    name: string;
    details: string;
  };
  orientation: "portrait" | "landscape";
  nameSize: string;
  headerColor: string;
  qrCodeSize: number;
  borderRadius: string;
  borderColor: string;
  borderWidth: string;
  layout: string;
  backgroundPattern: string;
  qrStyle: {
    color: string;
    backgroundColor: string;
    cornerColor: string;
    dotStyle: "rounded" | "square" | "dots";
    size: number;
  };
  elementPositions: {
    photo: { x: number; y: number };
    qrCode: { x: number; y: number };
    details: { x: number; y: number };
  };
  backgroundColor: string;
  textColor: string;
  headerTextColor: string;
  fontStyle: string;
  fontWeight: {
    header: string;
    name: string;
    details: string;
  };
  patternColor: string;
  patternOpacity: number;
  headerBgColor: string;
  footerBgColor: string;
}

const themes: Theme[] = [
  {
    id: "modern",
    name: "Modern",
    styles: {
      backgroundColor: "#ffffff",
      headerTextColor: "#1a365d",
      textColor: "#2d3748",
      borderColor: "#e2e8f0",
      gradientFrom: "from-blue-50",
      gradientTo: "to-indigo-50",
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    styles: {
      backgroundColor: "#fafafa",
      headerTextColor: "#1a202c",
      textColor: "#4a5568",
      borderColor: "#cbd5e0",
      pattern:
        "radial-gradient(circle at 50% 50%, #f7fafc 0%, transparent 10%)",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    styles: {
      backgroundColor: "#ffffff",
      headerTextColor: "#000000",
      textColor: "#4a5568",
      borderColor: "#e2e8f0",
    },
  },
];

const fontOptions = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
];

const fontSizeOptions = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

interface CardLayout {
  id: string;
  name: string;
  className: string;
  preview: string;
  layout: "standard" | "modern" | "compact" | "elegant";
}

interface BackgroundPattern {
  id: string;
  name: string;
  pattern: string | ((color: string) => string);
  size?: string;
}

const cardLayouts: CardLayout[] = [
  {
    id: "standard",
    name: "Standard",
    className: "layout-standard",
    preview: "/layouts/standard.png",
    layout: "standard",
  },
  {
    id: "modern",
    name: "Modern Split",
    className: "layout-modern",
    preview: "/layouts/modern.png",
    layout: "modern",
  },
  {
    id: "compact",
    name: "Compact",
    className: "layout-compact",
    preview: "/layouts/compact.png",
    layout: "compact",
  },
  {
    id: "elegant",
    name: "Elegant",
    className: "layout-elegant",
    preview: "/layouts/elegant.png",
    layout: "elegant",
  },
];

const backgroundPatterns: BackgroundPattern[] = [
  {
    id: "none",
    name: "None",
    pattern: "none",
  },
  {
    id: "dots",
    name: "Dots",
    pattern: (color: string) =>
      `radial-gradient(${color} 1px, transparent 1px)`,
    size: "20px 20px",
  },
  {
    id: "grid",
    name: "Grid",
    pattern: (color: string) => `linear-gradient(${color} 1px, transparent 1px),
      linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    size: "20px 20px",
  },
  {
    id: "diagonal",
    name: "Diagonal Lines",
    pattern: (color: string) =>
      `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
    size: "10px 10px",
  },
];

const defaultCustomization: CustomizationOptions = {
  primaryColor: "#3B82F6",
  secondaryColor: "#6366F1",
  fontFamily: "inter",
  fontSize: {
    header: "2xl",
    name: "xl",
    details: "base",
  },
  orientation: "portrait",
  nameSize: "xl",
  headerColor: "#1F2937",
  qrCodeSize: 64,
  borderRadius: "xl",
  borderColor: "#E5E7EB",
  borderWidth: "2",
  layout: "standard",
  backgroundPattern: "none",
  qrStyle: {
    color: "#000000",
    backgroundColor: "#FFFFFF",
    cornerColor: "#000000",
    dotStyle: "rounded",
    size: 64,
  },
  elementPositions: {
    photo: { x: 50, y: 30 },
    qrCode: { x: 80, y: 70 },
    details: { x: 50, y: 50 },
  },
  backgroundColor: "#ffffff",
  textColor: "#000000",
  headerTextColor: "#1f2937",
  fontStyle: "inter",
  fontWeight: {
    header: "bold",
    name: "semibold",
    details: "normal",
  },
  patternColor: "#e2e8f0",
  patternOpacity: 0.2,
  headerBgColor: "#3b82f6",
  footerBgColor: "#3b82f6",
};

const fontStyles = [
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "roboto", label: "Roboto" },
  { value: "montserrat", label: "Montserrat" },
  { value: "opensans", label: "Open Sans" },
];

const fontSizes = [
  { value: "xs", label: "Extra Small" },
  { value: "sm", label: "Small" },
  { value: "base", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
];

const fontWeights = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

const IDCardGenerator = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>("modern");
  const [customLogo, setCustomLogo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [logoError, setLogoError] = useState<string>("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const [customization, setCustomization] =
    useState<CustomizationOptions>(defaultCustomization);

  // Generate QR code data
  const generateQRData = () => {
    if (!student) return "";
    return JSON.stringify({
      id: student.personalInfo.admissionNumber,
      name: student.personalInfo.studentName,
      course: student.courses[0]?.courseEnroll.name,
      contact: student.personalInfo.contactNo,
    });
  };

  // Handle customization changes
  const handleCustomizationChange = (
    key: keyof CustomizationOptions,
    value: any
  ) => {
    setCustomization((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await crudRequest("GET", `/student/get-student/${id}`);
        if (response) {
          setStudent(response);
          console.log(response);
          setError(null);
        } else {
          setError("Student not found");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        setError("Failed to fetch student data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setLogoError("");

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setLogoError("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (e.g., max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setLogoError("Image size should be less than 2MB");
      return;
    }

    // Create URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCustomLogo("");
    setLogoError("");
  };

  const handleDownload = async () => {
    const element = document.querySelector(".id-card") as HTMLElement;
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `id-card-${student.personalInfo.studentName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating ID card:", error);
    }
  };

  const getCardStyle = () => {
    const style: React.CSSProperties = {
      backgroundColor: customization.backgroundColor,
      color: customization.textColor,
      fontFamily: `var(--font-${customization.fontStyle})`,
      borderRadius: `var(--radius-${customization.borderRadius})`,
      borderWidth: `${customization.borderWidth}px`,
      borderColor: customization.borderColor,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      // Adjusted dimensions
      width: customization.orientation === "landscape" ? "650px" : "400px",
      height: customization.orientation === "landscape" ? "400px" : "600px",
    };

    // Apply pattern if selected
    if (customization.backgroundPattern !== "none") {
      const pattern = backgroundPatterns.find(
        (p) => p.id === customization.backgroundPattern
      );
      if (pattern && pattern.pattern !== "none") {
        const patternColor = `${customization.patternColor}${Math.round(customization.patternOpacity * 255).toString(16)}`;
        style.backgroundImage =
          typeof pattern.pattern === "function"
            ? pattern.pattern(patternColor)
            : pattern.pattern;
        style.backgroundSize = pattern.size;
      }
    }

    return style;
  };

  const renderLayoutContent = () => {
    if (!student) return null;

    if (customization.orientation === "landscape") {
      return (
        <div className="flex h-full">
          {/* Left side */}
          <div className="flex flex-col items-center justify-center w-2/5 p-6 ">
            <div className="w-32 h-32 mb-4 overflow-hidden border-4 border-white rounded-full shadow-lg">
              <img
                src={student.photo || "/profile.jpg"}
                alt="Student"
                className="object-cover w-full h-full"
              />
            </div>
            <h2
              className="mb-4 text-center"
              style={{
                fontSize: `var(--font-size-${customization.fontSize.name})`,
                fontWeight: customization.fontWeight.name,
              }}
            >
              {student.personalInfo.studentName}
            </h2>
            <QRCodeSVG
              value={generateQRData()}
              size={90}
              level="H"
              fgColor={customization.qrStyle.color}
              bgColor={customization.qrStyle.backgroundColor}
              includeMargin={true}
              className="p-2 bg-white rounded shadow-sm"
            />
          </div>

          {/* Right side */}
          <div className="flex-1 p-6">
            <h1
              className="mb-4"
              style={{
                color: customization.headerTextColor,
                fontSize: `var(--font-size-${customization.fontSize.header})`,
                fontWeight: customization.fontWeight.header,
              }}
            >
              Student ID Card
            </h1>
            <div className="space-y-3">
              <InfoRow
                label="ID Number"
                value={student.personalInfo.admissionNumber}
                customization={customization}
              />
              <InfoRow
                label="Course"
                value={student.courses[0]?.courseEnroll.name}
                customization={customization}
              />
              <InfoRow
                label="Contact"
                value={student.personalInfo.contactNo}
                customization={customization}
              />
            </div>
          </div>
        </div>
      );
    } else {
      // Rest of the code remains unchanged
      switch (customization.layout) {
        case "modern":
          return (
            <div className="grid h-full grid-cols-2">
              <div className="p-4 bg-gradient-to-b from-primary/10 to-primary/5">
                {/* Photo and Name */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 overflow-hidden">
                    <img
                      src={student.photo || "/profile.jpg"}
                      alt="Student"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-center">
                    {student.personalInfo.studentName}
                  </h2>
                </div>
              </div>
              <div className="flex flex-col justify-between p-4">
                {/* Details and QR Code */}
                <div className="space-y-2">
                  <InfoRow
                    label="ID"
                    value={student.personalInfo.admissionNumber}
                    customization={customization}
                  />
                  <InfoRow
                    label="Course"
                    value={student.courses[0]?.courseEnroll.name}
                    customization={customization}
                  />
                  <InfoRow
                    label="Contact"
                    value={student.personalInfo.contactNo}
                    customization={customization}
                  />
                </div>
                <div className="flex justify-center">
                  <QRCodeSVG
                    value={generateQRData()}
                    size={customization.qrStyle.size}
                    level="H"
                    fgColor={customization.qrStyle.color}
                    bgColor={customization.qrStyle.backgroundColor}
                    includeMargin={true}
                    className="p-2 bg-white rounded"
                  />
                </div>
              </div>
            </div>
          );

        case "compact":
          return (
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center mb-4 space-x-4">
                <div className="w-24 h-24 overflow-hidden border-4 border-white rounded-full shadow-lg">
                  <img
                    src={student.photo || "/profile.jpg"}
                    alt="Student"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {student.personalInfo.studentName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {student.personalInfo.admissionNumber}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <InfoRow
                  label="Course"
                  value={student.courses[0]?.courseEnroll.name}
                  customization={customization}
                />
                <InfoRow
                  label="Contact"
                  value={student.personalInfo.contactNo}
                  customization={customization}
                />
              </div>
              <div className="flex justify-center mt-4">
                <QRCodeSVG
                  value={generateQRData()}
                  size={customization.qrStyle.size}
                  level="H"
                  fgColor={customization.qrStyle.color}
                  bgColor={customization.qrStyle.backgroundColor}
                  includeMargin={true}
                  className="p-2 bg-white rounded"
                />
              </div>
            </div>
          );

        case "elegant":
          return (
            <div className="relative h-full">
              <div
                className="absolute inset-0 opacity-5"
                style={{ backgroundImage: customization.backgroundPattern }}
              />
              <div className="relative z-10 flex flex-col h-full p-6">
                <div className="mb-6 text-center">
                  <h1
                    className="mb-2"
                    style={{
                      color: customization.headerTextColor,
                      fontSize: `var(--font-size-${customization.fontSize.header})`,
                      fontWeight: customization.fontWeight.header,
                      fontFamily: `var(--font-${customization.fontStyle})`,
                    }}
                  >
                    Student ID Card
                  </h1>
                  <p className="text-sm text-gray-600">
                    Academic Year {new Date().getFullYear()}
                  </p>
                </div>
                <div className="flex flex-col items-center mb-6">
                  <div className="mb-4 overflow-hidden border-4 rounded-full shadow-xl w-36 h-36 border-primary/20">
                    <img
                      src={student.photo || "/profile.jpg"}
                      alt="Student"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h2
                    style={{
                      fontSize: `var(--font-size-${customization.fontSize.name})`,
                      fontWeight: customization.fontWeight.name,
                      fontFamily: `var(--font-${customization.fontStyle})`,
                    }}
                  >
                    {student.personalInfo.studentName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {student.personalInfo.admissionNumber}
                  </p>
                </div>
                <div className="flex-1 space-y-3">
                  <InfoRow
                    label="Course"
                    value={student.courses[0]?.courseEnroll.name}
                    className="text-primary"
                    customization={customization}
                  />
                  <InfoRow
                    label="Contact"
                    value={student.personalInfo.contactNo}
                    className="text-primary"
                    customization={customization}
                  />
                  <InfoRow
                    label="Address"
                    value={student.personalInfo.address || "N/A"}
                    className="text-primary"
                    customization={customization}
                  />
                </div>
                <div className="flex justify-center mt-4">
                  <QRCodeSVG
                    value={generateQRData()}
                    size={customization.qrStyle.size}
                    level="H"
                    fgColor={customization.qrStyle.color}
                    bgColor={customization.qrStyle.backgroundColor}
                    includeMargin={true}
                    className="p-2 bg-white rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className="relative flex flex-col h-full">
              {/* Header Wave */}
              <div
                className="absolute top-0 left-0 right-0 overflow-hidden h-28"
                style={{
                  background: `linear-gradient(135deg, ${customization.headerBgColor}, ${customization.headerBgColor})`,
                }}
              >
                <div className="absolute bottom-0 left-0 w-full">
                  <svg
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    className="w-full h-20"
                    style={{ fill: customization.backgroundColor }}
                  >
                    <path d="M0,96L34.3,106.7C68.6,117,137,139,206,133.3C274.3,128,343,96,411,90.7C480,85,549,107,617,128C685.7,149,754,171,823,165.3C891.4,160,960,128,1029,117.3C1097.1,107,1166,117,1234,122.7C1302.9,128,1371,128,1406,128L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z" />
                  </svg>
                </div>
              </div>

              {/* Card Content */}
              <div className="z-10 flex flex-col h-full p-6">
                {/* Header Section with Fixed Height */}
                <div className="h-24 text-center">
                  <h1
                    className="relative mb-2"
                    style={{
                      color: customization.headerTextColor,
                      fontSize: `var(--font-size-${customization.fontSize.header})`,
                      fontWeight: customization.fontWeight.header,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    Student ID Card
                  </h1>
                  {customLogo && (
                    <img
                      src={customLogo}
                      alt="Logo"
                      className="h-10 mx-auto mt-2"
                    />
                  )}
                </div>

                {/* Main Content with Flex Auto */}
                <div className="flex flex-col justify-between flex-1 min-h-0">
                  {/* Photo and Details */}
                  <div>
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative">
                        <div className="mb-3 overflow-hidden border-4 rounded-full shadow-lg w-28 h-28">
                          <img
                            src={student.photo || "/profile.jpg"}
                            alt="Student"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <h2 className="mb-1 text-center">
                        {student.personalInfo.studentName}
                      </h2>
                      <p className="px-3 py-1 text-sm rounded-full bg-opacity-10">
                        {student.personalInfo.admissionNumber}
                      </p>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-2">
                      {[
                        {
                          label: "Course",
                          value: student.courses[0]?.courseEnroll.name,
                        },
                        {
                          label: "Contact",
                          value: student.personalInfo.contactNo,
                        },
                        {
                          label: "Address",
                          value: student.personalInfo.address || "N/A",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="p-1.5 rounded-lg hover:bg-black/5"
                        >
                          <InfoRow
                            label={item.label}
                            value={item.value}
                            customization={customization}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Section with Fixed Height */}
                  <div className="flex items-center justify-center mt-2 h-28">
                    <div
                      className="p-2 bg-white shadow-sm rounded-xl"
                      style={{
                        background:
                          "linear-gradient(to bottom right, #fff, #f8fafc)",
                        border: `1px solid ${customization.headerBgColor}10`,
                      }}
                    >
                      <QRCodeSVG
                        value={generateQRData()}
                        size={90}
                        level="H"
                        fgColor={customization.qrStyle.color}
                        bgColor={customization.qrStyle.backgroundColor}
                        includeMargin={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Wave */}
              <div
                className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${customization.footerBgColor}, ${customization.footerBgColor})`,
                }}
              >
                <div className="absolute top-0 left-0 w-full rotate-180">
                  <svg
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    className="w-full h-20"
                    style={{ fill: customization.backgroundColor }}
                  >
                    <path d="M0,64L34.3,85.3C68.6,107,137,149,206,160C274.3,171,343,149,411,128C480,107,549,85,617,90.7C685.7,96,754,128,823,154.7C891.4,181,960,203,1029,192C1097.1,181,1166,139,1234,122.7C1302.9,107,1371,117,1406,122.7L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z" />
                  </svg>
                </div>
              </div>
            </div>
          );
      }
    }
  };

  const handleThemeChange = (themeId: string) => {
    const selectedTheme = themes.find((theme) => theme.id === themeId);
    if (selectedTheme) {
      setCustomization((prev) => ({
        ...prev,
        backgroundColor: selectedTheme.styles.backgroundColor,
        headerTextColor: selectedTheme.styles.headerTextColor,
        textColor: selectedTheme.styles.textColor,
        borderColor: selectedTheme.styles.borderColor,
      }));
      setSelectedTheme(themeId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="mb-4 text-2xl font-bold text-red-500">
          {error || "Student not found"}
        </h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customization Panel */}
        <Card className="p-4">
          <h2 className="mb-4 text-2xl font-bold">ID Card Customization</h2>

          <div className="space-y-6">
            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Colors</h3>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) =>
                      handleCustomizationChange(
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) =>
                      handleCustomizationChange(
                        "backgroundColor",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) =>
                      handleCustomizationChange("textColor", e.target.value)
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customization.textColor}
                    onChange={(e) =>
                      handleCustomizationChange("textColor", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Header Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={customization.headerTextColor}
                    onChange={(e) =>
                      handleCustomizationChange(
                        "headerTextColor",
                        e.target.value
                      )
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customization.headerTextColor}
                    onChange={(e) =>
                      handleCustomizationChange(
                        "headerTextColor",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Typography</h3>

              <div className="space-y-2">
                <Label>Font Style</Label>
                <Select
                  value={customization.fontStyle}
                  onValueChange={(value) =>
                    handleCustomizationChange("fontStyle", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font style" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyles.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Header Typography */}
              <div className="space-y-2">
                <Label>Header Typography</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={customization.fontSize.header}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontSize", {
                        ...customization.fontSize,
                        header: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font size" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={customization.fontWeight.header}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontWeight", {
                        ...customization.fontWeight,
                        header: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font weight" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeights.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Name Typography */}
              <div className="space-y-2">
                <Label>Name Typography</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={customization.fontSize.name}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontSize", {
                        ...customization.fontSize,
                        name: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font size" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={customization.fontWeight.name}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontWeight", {
                        ...customization.fontWeight,
                        name: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font weight" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeights.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Details Typography */}
              <div className="space-y-2">
                <Label>Details Typography</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={customization.fontSize.details}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontSize", {
                        ...customization.fontSize,
                        details: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font size" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={customization.fontWeight.details}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontWeight", {
                        ...customization.fontWeight,
                        details: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font weight" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontWeights.map((weight) => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Select Theme</Label>
                <Select value={selectedTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Upload Logo</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="cursor-pointer"
                  />
                  {logoError && (
                    <p className="text-sm text-red-500">{logoError}</p>
                  )}
                  {customLogo && (
                    <div className="flex items-center gap-2">
                      <img
                        src={customLogo}
                        alt="Preview"
                        className="object-contain w-10 h-10"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveLogo}
                      >
                        Remove Logo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Orientation</Label>
                  <Select
                    value={customization.orientation}
                    onValueChange={(value: "portrait" | "landscape") =>
                      handleCustomizationChange("orientation", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font Family</Label>
                  <Select
                    value={customization.fontFamily}
                    onValueChange={(value) =>
                      handleCustomizationChange("fontFamily", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Select
                    value={customization.fontSize.details} // or .header or .name depending on context
                    onValueChange={(value) =>
                      handleCustomizationChange("fontSize", {
                        ...customization.fontSize,
                        details: value, // or header/name depending on context
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizeOptions.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) =>
                        handleCustomizationChange(
                          "primaryColor",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      type="text"
                      value={customization.primaryColor}
                      onChange={(e) =>
                        handleCustomizationChange(
                          "primaryColor",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Border Radius</Label>
                  <Select
                    value={customization.borderRadius}
                    onValueChange={(value) =>
                      handleCustomizationChange("borderRadius", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select border radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Background Pattern</Label>
                  <Select
                    value={customization.backgroundPattern}
                    onValueChange={(value) =>
                      handleCustomizationChange("backgroundPattern", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundPatterns.map((pattern) => (
                        <SelectItem key={pattern.id} value={pattern.id}>
                          {pattern.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {customization.backgroundPattern !== "none" && (
                  <>
                    <div>
                      <Label>Pattern Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customization.patternColor}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "patternColor",
                              e.target.value
                            )
                          }
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={customization.patternColor}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "patternColor",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Pattern Opacity</Label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[customization.patternOpacity]}
                        onValueChange={([value]) =>
                          handleCustomizationChange("patternOpacity", value)
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Header Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customization.headerBgColor}
                      onChange={(e) =>
                        handleCustomizationChange(
                          "headerBgColor",
                          e.target.value
                        )
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={customization.headerBgColor}
                      onChange={(e) =>
                        handleCustomizationChange(
                          "headerBgColor",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Footer Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customization.footerBgColor}
                      onChange={(e) =>
                        handleCustomizationChange(
                          "footerBgColor",
                          e.target.value
                        )
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={customization.footerBgColor}
                      onChange={(e) =>
                        handleCustomizationChange(
                          "footerBgColor",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleDownload} className="w-full">
                Download ID Card
              </Button>
            </div>
          </div>
        </Card>

        {/* ID Card Preview */}
        <Card className="p-4">
          <h2 className="mb-4 text-2xl font-bold">Preview</h2>

          <div className="flex items-center justify-center min-h-[600px] rounded-lg p-4">
            <div
              className={`id-card ${
                cardLayouts.find((l) => l.id === customization.layout)
                  ?.className
              }`}
              style={getCardStyle()}
            >
              {renderLayoutContent()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  className = "",
  customization,
}: {
  label: string;
  value: string;
  className?: string;
  customization: CustomizationOptions;
}) => (
  <div
    className={`flex justify-between items-center py-1.5 ${className}`}
    style={{
      color: customization.textColor,
      fontSize: `var(--font-size-${customization.fontSize.details})`,
      fontWeight: customization.fontWeight.details,
      fontFamily: `var(--font-${customization.fontStyle})`,
    }}
  >
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

export default IDCardGenerator;
