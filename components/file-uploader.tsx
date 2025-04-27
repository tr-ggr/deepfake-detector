"use client";

import type React from "react";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileRejection } from "react-dropzone";
import Image from "next/image";

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  onClearFile: () => void;
  currentFile: File | null;
  className?: string;
  maxFiles?: number;
  accept?: Record<string, string[]>;
}

export function FileUploader({
  onFilesAdded,
  onClearFile,
  currentFile,
  className,
  maxFiles = 1,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  },
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate preview URL when file changes
  useEffect(() => {
    if (!currentFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(currentFile);
    setPreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [currentFile]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (rejection?.errors[0]?.code === "file-invalid-type") {
      setError("Invalid file type. Please upload an image file.");
    } else {
      setError("File upload failed. Please try again.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxFiles,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    disabled: !!preview,
  });

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    onClearFile();
  };

  return (
    <div className="space-y-2 w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl text-center cursor-pointer transition-all relative overflow-hidden shadow-sm",
          isDragging || isDragActive
            ? "border-primary bg-primary/5 shadow-md"
            : error
            ? "border-red-400 bg-red-50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50",
          preview ? "p-0" : "p-8",
          className
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Uploaded image"
              className="w-full h-full object-contain"
            />
            <button
              onClick={handleClearFile}
              className="absolute top-3 right-3 bg-black/70 text-white rounded-full p-1.5 hover:bg-black/90 transition-colors shadow-md"
              aria-label="Remove image"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-red-500">
                <AlertCircle className="h-10 w-10 opacity-80" />
                <p className="text-lg font-medium">Invalid file type</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-100 p-4 rounded-full">
                  <Upload className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-lg font-medium text-slate-700">
                  DROP FILE HERE
                </p>
                <p className="text-sm text-slate-500">or click to browse</p>
              </>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
