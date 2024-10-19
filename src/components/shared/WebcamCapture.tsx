import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Function to convert dataURL to File
const dataURLtoFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);

  // Ensure mimeMatch is not null
  if (!mimeMatch) {
    throw new Error("Invalid data URL: unable to determine MIME type.");
  }

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

interface WebcamCaptureProps {
  onCapture: (file: Blob) => void; // Adjust type here if needed
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; preview: string }[]
  >([]);

  useEffect(() => {
    const getVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };
    getVideoStream();
  }, [facingMode]);

  const capturePhoto = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImage(dataUrl);
        setSelectedFiles([]); // Clear selected files when a photo is captured

        // Convert the data URL to a File and pass it to the parent component
        const file = dataURLtoFile(dataUrl, "captured-image.png");
        onCapture(file);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const filePreviews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedFiles(filePreviews);
      setCapturedImage(null); // Clear captured image when a file is selected
      onCapture(filePreviews[0].file);
    }
  };

  return (
    <div className="flex flex-col items-center mb-10 space-y-4">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative w-full max-w-md">
          <video
            ref={videoRef}
            autoPlay
            className="border border-gray-300 rounded-lg shadow-md h-[250px]"
          ></video>
          <canvas
            ref={canvasRef}
            className="hidden"
            width="640"
            height="480"
          ></canvas>
        </div>

        <div className="w-full max-w-md mt-4">
          <p className="mb-2 text-sm font-medium">Preview:</p>
          <div className="grid grid-cols-2 gap-4">
            {capturedImage && (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-auto border border-gray-300 rounded-lg shadow-md"
                />
                <p className="mt-1 text-xs truncate">Captured Image</p>
              </div>
            )}
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={file.preview}
                  alt={`Selected preview ${index + 1}`}
                  className="w-full h-auto border border-gray-300 rounded-lg shadow-md"
                />
                <p className="mt-1 text-xs truncate">{file.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex p-10 space-x-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              setFacingMode(facingMode === "user" ? "environment" : "user");
            }}
          >
            Switch Camera
          </Button>
          <Button onClick={capturePhoto}>Capture Photo</Button>
        </div>

        <div className="w-full max-w-md mt-4 cursor-pointer">
          <label className="block text-sm font-medium cursor-pointer">
            Select a File
          </label>
          <Input
            type="file"
            onChange={handleFileChange}
            className="mt-2 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;
