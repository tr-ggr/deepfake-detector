"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { FileUploader } from "./file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DeepfakeDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      // Reset result when new file is uploaded
      setResult(null);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleEvaluate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Send the request to the API endpoint
      const response = await fetch(
        "https://deepfake-detector-three.vercel.app:5000/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process image");
      }

      const data = await response.json();
      console.log(data);
      setResult(data.result);
    } catch (err) {
      console.error("Error processing image:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8">
          {/* Header */}
          <div className="flex items-center justify-center gap-4 w-full">
            <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              DEEPFAKE
              <br />
              OR NOT?
            </h1>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <Image
                src="/Thinking_Face_Emoji-Emoji-Island.png"
                alt="Thinking emoji"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Result Display */}
          {(result == "True") !== null && (
            <div
              className={`w-full text-center p-6 rounded-xl border shadow-sm ${
                result == "True"
                  ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                  : "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {result == "True" ? (
                  <>
                    <XCircle className="h-12 w-12 text-red-500" />
                    <p className="text-xl font-medium">
                      This image is a{" "}
                      <span className="text-2xl font-bold text-red-600">
                        DEEPFAKE
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-xl font-medium">
                      This image is{" "}
                      <span className="text-2xl font-bold text-green-600">
                        AUTHENTIC
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="w-full text-center bg-red-50 p-4 rounded-xl border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* File Uploader */}
          <FileUploader
            onFilesAdded={handleFileChange}
            className="w-full aspect-video"
            currentFile={file}
            onClearFile={() => setFile(null)}
          />

          {/* Action Button */}
          <Button
            className="w-full py-7 text-lg font-medium tracking-wide shadow-lg transition-all hover:shadow-xl"
            disabled={!file || isProcessing}
            onClick={handleEvaluate}
            variant="default"
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>EVALUATING</span>
              </span>
            ) : (
              "EVALUATE"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
