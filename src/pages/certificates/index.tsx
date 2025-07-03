import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { Download, FileText, Search, Plus, Users, Award } from "lucide-react";
import CertificateCreateForm from "./components/CertificateCreateForm";
import FullWidthPreview from "./components/FullWidthPreview";
import BulkGeneration from "./components/BulkGeneration";

interface CertificateLayout {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  instituteName: string;
  instituteAddress: string;
}

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
  certificateNumber: string;
  percentage: number;
  grade: string;
  issueDate: string;
  status: string;
  documentUrl?: string;
  description: string;
  layout: CertificateLayout;
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
}

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    certificates: 0,
    marksheets: 0,
  });

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [searchQuery, filterType]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("certificateType", filterType);
      
      const response = await crudRequest<{
        success: boolean;
        data: Certificate[];
      }>("GET", `/certificate/list?${params.toString()}`);
      
      if (response.success) {
        const filteredData = response.data.filter((cert) =>
          cert.student.personalInfo.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setCertificates(filteredData);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await crudRequest<{
        success: boolean;
        data: {
          total: number;
          certificates: number;
          marksheets: number;
        };
      }>("GET", "/certificate/stats");
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDownloadPDF = async (certificateId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/certificate/${certificateId}/generate-pdf`,
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
        a.download = `certificate_${certificateId}.pdf`;
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
    }
  };

  const handleFullPreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setFullPreviewOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Certificates & Marksheets</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkModalOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Marksheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.marksheets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or certificate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="certificate">Certificates</SelectItem>
            <SelectItem value="marksheet">Marksheets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="text-center py-8">Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No certificates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      certificate.certificateType === "certificate"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {certificate.certificateType === "certificate" ? (
                      <Award className="h-3 w-3 mr-1" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {certificate.certificateType}
                  </Badge>
                  <Badge
                    variant={
                      certificate.status === "issued" ? "default" : "outline"
                    }
                  >
                    {certificate.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{certificate.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Student:</strong> {certificate.student.personalInfo.studentName}
                  </p>
                  <p className="text-sm">
                    <strong>Admission No:</strong> {certificate.student.personalInfo.admissionNumber}
                  </p>
                  <p className="text-sm">
                    <strong>Course:</strong> {certificate.course.name}
                  </p>
                  <p className="text-sm">
                    <strong>Certificate No:</strong> {certificate.certificateNumber}
                  </p>
                  <p className="text-sm">
                    <strong>Grade:</strong> {certificate.grade} ({certificate.percentage.toFixed(1)}%)
                  </p>
                  <p className="text-sm">
                    <strong>Issue Date:</strong> {new Date(certificate.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFullPreview(certificate)}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(certificate._id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        title="Create Certificate/Marksheet"
        description="Generate a new certificate or marksheet for a student"
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <CertificateCreateForm
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchCertificates();
            fetchStats();
          }}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>

      {/* Full Width Preview Modal */}
      <Modal
        title=""
        description=""
        isOpen={fullPreviewOpen}
        onClose={() => setFullPreviewOpen(false)}
        className="max-w-full w-full h-full"
      >
        {selectedCertificate && (
          <FullWidthPreview
            certificate={selectedCertificate}
            onClose={() => setFullPreviewOpen(false)}
          />
        )}
      </Modal>

      {/* Bulk Generation Modal */}
      <Modal
        title="Bulk Certificate Generation"
        description="Generate certificates or marksheets for multiple students"
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        className="max-w-4xl"
      >
        <BulkGeneration
          onSuccess={() => {
            setBulkModalOpen(false);
            fetchCertificates();
            fetchStats();
          }}
          onCancel={() => setBulkModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default CertificatesPage;
