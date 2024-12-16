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

interface Theme {
  id: string;
  name: string;
  className: string;
  preview: string;
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
}

const themes: Theme[] = [
  {
    id: "modern",
    name: "Modern",
    className: "bg-gradient-to-r from-blue-500 to-purple-500",
    preview: "/themes/modern.png",
  },
  {
    id: "minimal",
    name: "Minimal",
    className: "bg-white border-2 border-gray-200",
    preview: "/themes/minimal.png",
  },
  {
    id: "dark",
    name: "Dark",
    className: "bg-gray-900 text-white",
    preview: "/themes/dark.png",
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
  pattern: string;
  preview: string;
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
    pattern: "",
    preview: "/patterns/none.png",
  },
  {
    id: "dots",
    name: "Dots",
    pattern:
      "radial-gradient(circle, #00000010 1px, transparent 1px) 0 0/20px 20px",
    preview: "/patterns/dots.png",
  },
  {
    id: "lines",
    name: "Lines",
    pattern:
      "linear-gradient(45deg, #00000008 25%, transparent 25%, transparent 75%, #00000008 75%, #00000008)",
    preview: "/patterns/lines.png",
  },
  {
    id: "grid",
    name: "Grid",
    pattern:
      "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
    preview: "/patterns/grid.png",
  },
];

const qrStyles = [
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
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
      fontFamily: customization.fontFamily,
      backgroundColor: customization.backgroundColor,
      color: customization.textColor,
      borderRadius: `var(--radius-${customization.borderRadius})`,
      borderWidth: `${customization.borderWidth}px`,
      borderColor: customization.borderColor,
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    };

    if (customization.orientation === "landscape") {
      style.width = "540px";
      style.height = "340px";
    } else {
      style.width = "340px";
      style.height = "540px";
    }

    return style;
  };

  const renderLayoutContent = () => {
    if (!student) return null;

    switch (customization.layout) {
      case "modern":
        return (
          <div className="grid h-full grid-cols-2">
            <div className="p-4 bg-gradient-to-b from-primary/10 to-primary/5">
              {/* Photo and Name */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-4 overflow-hidden border-4 border-white rounded-full shadow-lg">
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
                  style={{ color: customization.headerTextColor }}
                  className="mb-1 text-2xl font-bold"
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
                <h2 className="text-xl font-bold text-center">
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
          <div className="flex flex-col h-full p-6">
            {/* Header with Logo */}
            <div className="mb-4 text-center">
              <h1
                className="mb-2 text-2xl font-bold"
                style={{ color: customization.headerTextColor }}
              >
                Student ID Card
              </h1>
              {customLogo && (
                <img
                  src={customLogo}
                  alt="Logo"
                  className="h-10 mx-auto mb-2" // Reduced height and margin
                />
              )}
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1">
              {/* Photo and Name */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 mb-2 overflow-hidden border-4 border-white rounded-full shadow-lg">
                  <img
                    src={student.photo || "/profile.jpg"}
                    alt="Student"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-bold">
                  {student.personalInfo.studentName}
                </h2>
                <p className="text-sm">
                  {student.personalInfo.admissionNumber}
                </p>
              </div>

              {/* Details */}
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
                <InfoRow
                  label="Address"
                  value={student.personalInfo.address || "N/A"}
                  customization={customization}
                />
              </div>

              {/* QR Code */}
              <div className="pt-2 mt-auto">
                {" "}
                {/* Changed to mt-auto to push to bottom */}
                <QRCodeSVG
                  value={generateQRData()}
                  size={customization.qrStyle.size}
                  level="H"
                  fgColor={customization.qrStyle.color}
                  bgColor={customization.qrStyle.backgroundColor}
                  includeMargin={true}
                  className="p-2 mx-auto bg-white rounded"
                />
              </div>
            </div>
          </div>
        );
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
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
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

              <Button onClick={handleDownload} className="w-full">
                Download ID Card
              </Button>
            </div>
          </div>
        </Card>

        {/* ID Card Preview */}
        <Card className="p-4">
          <h2 className="mb-4 text-2xl font-bold">Preview</h2>

          <div className="flex items-center justify-center min-h-[600px] bg-gray-100 rounded-lg p-4">
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
    style={{ color: customization.textColor }}
  >
    <span className="text-sm font-medium">{label}:</span>
    <span className="text-sm">{value}</span>
  </div>
);

export default IDCardGenerator;
