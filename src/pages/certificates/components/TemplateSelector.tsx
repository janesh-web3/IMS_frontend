import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { Check, Palette, Type, Building } from "lucide-react";

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

interface TemplateSelectorProps {
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
  onCustomize: (template: Template) => void;
}

const TemplateSelector = ({ selectedTemplate, onTemplateSelect, onCustomize }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await crudRequest<{
        success: boolean;
        data: Template[];
      }>("GET", "/certificate/templates");
      
      if (response.success) {
        setTemplates(response.data);
        if (!selectedTemplate && response.data.length > 0) {
          onTemplateSelect(response.data[0]); // Select first template by default
        }
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "classic": return "🏛️";
      case "modern": return "🚀";
      case "elegant": return "💎";
      case "professional": return "🏢";
      default: return "📄";
    }
  };

  const getThemeDescription = (theme: string) => {
    switch (theme) {
      case "classic": return "Traditional design with elegant borders and serif fonts";
      case "modern": return "Clean, minimalist design with bold typography";
      case "elegant": return "Sophisticated layout with decorative elements";
      case "professional": return "Corporate style with structured layout";
      default: return "Standard template";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-gray-600">Select from our professionally designed templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.name}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate?.name === template.name 
                ? `ring-2 ring-offset-2 shadow-lg` 
                : 'hover:scale-105'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getThemeIcon(template.theme)}</span>
                  <CardTitle className="text-base">{template.displayName}</CardTitle>
                </div>
                {selectedTemplate?.name === template.name && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              <p className="text-xs text-gray-500">{getThemeDescription(template.theme)}</p>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Mini Preview */}
              <div 
                className="h-32 rounded border-2 p-3 text-xs relative overflow-hidden"
                style={{ 
                  backgroundColor: template.backgroundColor,
                  borderColor: template.borderColor
                }}
              >
                {/* Header */}
                <div 
                  className="text-center mb-1"
                  style={{ color: template.primaryColor }}
                >
                  <div className="font-bold text-sm">{template.instituteName}</div>
                  <div className="text-xs opacity-75">{template.instituteAddress}</div>
                </div>
                
                {/* Title */}
                <div 
                  className="text-center font-bold text-sm mb-2"
                  style={{ color: template.secondaryColor }}
                >
                  Certificate
                </div>
                
                {/* Content lines */}
                <div className="space-y-1 text-xs opacity-60">
                  <div className="h-1 bg-current w-3/4 mx-auto"></div>
                  <div className="h-1 bg-current w-1/2 mx-auto"></div>
                  <div className="h-1 bg-current w-2/3 mx-auto"></div>
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Palette className="h-3 w-3" />
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded border"
                      style={{ backgroundColor: template.primaryColor }}
                    ></div>
                    <div 
                      className="w-3 h-3 rounded border"
                      style={{ backgroundColor: template.secondaryColor }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Type className="h-3 w-3" />
                  <span>{template.fontFamily}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Building className="h-3 w-3" />
                  <span className="truncate">{template.instituteName}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant={selectedTemplate?.name === template.name ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template);
                  }}
                >
                  {selectedTemplate?.name === template.name ? "Selected" : "Select"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCustomize(template);
                  }}
                >
                  Customize
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTemplate && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getThemeIcon(selectedTemplate.theme)}</span>
            <div>
              <h4 className="font-semibold text-blue-900">{selectedTemplate.displayName} Template Selected</h4>
              <p className="text-sm text-blue-700">{getThemeDescription(selectedTemplate.theme)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
