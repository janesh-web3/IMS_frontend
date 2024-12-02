import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Shadcn UI Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crudRequest } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { File, Image } from "lucide-react";

type ResponseElement = JSX.Element;

const GeminiPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setPhotoPreview(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const formatResponse = (text: string): JSX.Element => {
    const lines = text.split("\n"); // Split into lines for processing
    const elements: ResponseElement[] = []; // Define as an array of JSX elements

    lines.forEach((line, index) => {
      if (line.startsWith("***")) {
        // Handle `***` as a styled heading or separator
        elements.push(
          <h2 key={index} className="mt-4 text-xl font-semibold">
            {line.replace("***", "").trim()}
          </h2>
        );
      } else if (line.startsWith("*") || line.startsWith("-")) {
        // Handle `*` or `-` as bullet points
        const bullet = line.replace(/^\*+|-+/, "").trim();
        elements.push(
          <li key={index} className="ml-6 list-disc">
            {bullet}
          </li>
        );
      } else {
        // Default handling for regular text
        elements.push(
          <p key={index} className="mb-2">
            {line}
          </p>
        );
      }
    });

    return <div>{elements}</div>;
  };

  const handleSendPrompt = async () => {
    setLoading(true);
    try {
      let result;
      if (file) {
        if (photoPreview) {
          // Send to photo upload endpoint
          result = await crudRequest<{ message: string }>(
            "POST",
            "/gemini/upload-photo",
            { photo: file, prompt: prompt },
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } else {
          // Send to file upload endpoint
          result = await crudRequest<{ message: string }>(
            "POST",
            "/gemini/upload-file",
            { file: file, prompt: prompt },
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        }

        setResponse(result.message || "Upload successful!");
      } else if (prompt.trim()) {
        // Send text prompt to the API
        result = await crudRequest<{ data: string }>(
          "POST",
          "/gemini/get-response",
          { prompt }
        );
        setResponse(result.data);
      } else {
        setResponse("Please provide a prompt, photo, or file.");
      }
    } catch (error) {
      setResponse("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-y-auto">
      <div className="flex w-full max-w-6xl mx-auto">
        <Card className="w-full mx-1 mt-5 mb-10 shadow-lg md:mt-10 md:mb-20 md:mx-10 ">
          <CardHeader>
            <CardTitle>Ask AI Anything</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {/* Textarea for prompt */}
              <Textarea
                placeholder="Enter your detailed prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full"
              />

              {/* File input with icon */}
              <div className="flex items-center space-x-1 md:space-x-4">
                <label className="flex items-center space-x-1 cursor-pointer md:space-x-2">
                  <File className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Attach File</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Photo input with icon */}
                <label className="flex items-center space-x-1 cursor-pointer md:space-x-2">
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Attach Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo preview */}
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Uploaded preview"
                  className="rounded-lg shadow-md max-h-20 md:max-h-32"
                />
              )}

              {/* Submit button */}
              <Button onClick={handleSendPrompt} disabled={loading}>
                {loading ? "Processing..." : "Send Prompt"}
              </Button>

              {/* Response */}
              {response && (
                <div className="p-2 mt-4 border rounded-lg md:p-4 bg-background">
                  <strong>Response:</strong>
                  <p className="my-2">
                    {" "}
                    {response && formatResponse(response)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeminiPrompt;
