"use client";

import { useCallback, useState } from "react";
import {
  useDropzone,
  type FileRejection,
} from "react-dropzone";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  collegeService,
  type ExcelImportResult,
} from "@/lib/services";

import { PageHeader } from "@/components/ui";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Student Excel upload failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Student Excel upload failed";
};

export default function UploadStudentDatabasePage() {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [result, setResult] =
    useState<ExcelImportResult | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setResult(null);

        const response =
          await collegeService.upload(file);

        const importResult =
          response.data.data;

        setResult(importResult);

        console.log(
          "Student Excel import completed:",
          importResult,
        );

        if (
          importResult.error_count > 0 ||
          importResult.skipped > 0
        ) {
          toast.warning(
            `Import completed with ${importResult.error_count} errors and ${importResult.skipped} skipped records`,
          );
        } else {
          toast.success(
            response.data.message ??
              "Students imported successfully",
          );
        }
      } catch (error: unknown) {
        const message =
          getErrorMessage(error);

        console.error(
          "Student Excel upload failed:",
          error,
        );

        toast.error(message);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

const onDrop = useCallback(
  async (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
  ) => {
    setResult(null);

    if (fileRejections.length > 0) {
      const firstError =
        fileRejections[0]?.errors[0];

      if (
        firstError?.code ===
        "file-too-large"
      ) {
        toast.error(
          "Excel file must be smaller than 10 MB",
        );
        return;
      }

      if (
        firstError?.code ===
        "file-invalid-type"
      ) {
        toast.error(
          "Only .xlsx and .xls files are allowed",
        );
        return;
      }

      if (
        firstError?.code ===
        "too-many-files"
      ) {
        toast.error(
          "Only one Excel file can be uploaded at a time",
        );
        return;
      }

      toast.error(
        firstError?.message ??
          "Invalid Excel file",
      );

      return;
    }

    const file = acceptedFiles[0];

    if (!file) {
      toast.error(
        "Please select an Excel file",
      );
      return;
    }

    setSelectedFile(file);

    await uploadFile(file);
  },
  [uploadFile],
);

  const dropzone = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        [".xlsx"],

      "application/vnd.ms-excel": [
        ".xls",
      ],
    },

    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploading,
    onDrop,
  });

  const clearSelection = () => {
    setSelectedFile(null);
    setResult(null);

    dropzone.inputRef.current?.value &&
      (dropzone.inputRef.current.value =
        "");
  };

  return (
    <>
      <PageHeader
        title="Upload Student Database"
        description="Upload the student Excel file using the prescribed format."
      />

      <div className="space-y-6">
        <div
          {...dropzone.getRootProps()}
          className={[
            "relative grid min-h-72 cursor-pointer place-items-center rounded-2xl border-2 border-dashed bg-white px-6 text-center transition",
            dropzone.isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-blue-500 hover:bg-slate-50",
            uploading
              ? "cursor-not-allowed opacity-70"
              : "",
          ].join(" ")}
        >
          <input
            {...dropzone.getInputProps()}
          />

          <div>
            {uploading ? (
              <Loader2
                className="mx-auto mb-4 animate-spin text-blue-600"
                size={44}
              />
            ) : (
              <UploadCloud
                className="mx-auto mb-4 text-blue-600"
                size={44}
              />
            )}

            <h3 className="text-lg font-semibold text-slate-900">
              {uploading
                ? "Uploading and processing Excel file"
                : dropzone.isDragActive
                  ? "Drop the Excel file here"
                  : "Drop Excel file here"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {uploading
                ? "Please wait while student records are being processed."
                : "or click to browse .xlsx / .xls"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Maximum file size: 10 MB
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2">
                <FileSpreadsheet
                  className="text-emerald-600"
                  size={24}
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {selectedFile.name}
                </p>

                <p className="text-sm text-slate-500">
                  {(
                    selectedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                aria-label="Remove selected file"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {result && (
          <ImportResultCard
            result={result}
          />
        )}
      </div>
    </>
  );
}

function ImportResultCard({
  result,
}: {
  result: ExcelImportResult;
}) {
  const hasIssues =
    result.error_count > 0 ||
    result.skipped > 0;

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        {hasIssues ? (
          <AlertCircle
            className="mt-0.5 shrink-0 text-amber-500"
            size={24}
          />
        ) : (
          <CheckCircle2
            className="mt-0.5 shrink-0 text-emerald-600"
            size={24}
          />
        )}

        <div>
          <h3 className="font-semibold text-slate-900">
            {hasIssues
              ? "Import completed with issues"
              : "Import completed successfully"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Review the import summary below.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total rows"
          value={result.total_rows}
        />

        <SummaryCard
          label="Inserted"
          value={result.inserted}
        />

        <SummaryCard
          label="Updated"
          value={result.updated}
        />

        <SummaryCard
          label="Skipped"
          value={result.skipped}
        />

        <SummaryCard
          label="Warnings"
          value={result.warning_count}
        />

        <SummaryCard
          label="Errors"
          value={result.error_count}
        />
      </div>

      {result.errors.length > 0 && (
        <div>
          <h4 className="mb-3 font-medium text-red-700">
            Import errors
          </h4>

          <div className="max-h-72 overflow-auto rounded-xl border border-red-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-red-50 text-red-800">
                <tr>
                  <th className="px-4 py-3">
                    Row
                  </th>

                  <th className="px-4 py-3">
                    Registration number
                  </th>

                  <th className="px-4 py-3">
                    Message
                  </th>
                </tr>
              </thead>

              <tbody>
                {result.errors.map(
                  (error, index) => (
                    <tr
                      key={`${error.row}-${index}`}
                      className="border-t border-red-100"
                    >
                      <td className="px-4 py-3">
                        {error.row}
                      </td>

                      <td className="px-4 py-3">
                        {error.registration_number ??
                          "-"}
                      </td>

                      <td className="px-4 py-3 text-red-700">
                        {error.message}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div>
          <h4 className="mb-3 font-medium text-amber-700">
            Import warnings
          </h4>

          <div className="max-h-72 overflow-auto rounded-xl border border-amber-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-amber-50 text-amber-800">
                <tr>
                  <th className="px-4 py-3">
                    Row
                  </th>

                  <th className="px-4 py-3">
                    Registration number
                  </th>

                  <th className="px-4 py-3">
                    Message
                  </th>
                </tr>
              </thead>

              <tbody>
                {result.warnings.map(
                  (warning, index) => (
                    <tr
                      key={`${warning.row}-${index}`}
                      className="border-t border-amber-100"
                    >
                      <td className="px-4 py-3">
                        {warning.row}
                      </td>

                      <td className="px-4 py-3">
                        {warning.registration_number ??
                          "-"}
                      </td>

                      <td className="px-4 py-3 text-amber-700">
                        {warning.message}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}