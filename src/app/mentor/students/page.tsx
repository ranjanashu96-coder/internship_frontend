"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ColumnDef,
} from "@tanstack/react-table";

import {
  useRouter,
} from "next/navigation";

import {
  Eye,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  DataTable,
} from "@/components/data-table";

import {
  Badge,
  Button,
  PageHeader,
} from "@/components/ui";

import {
  mentorService,
} from "@/lib/services";

import type {
  Student,
} from "@/types";

const getErrorMessage = (
  error: unknown,
) => {
  const requestError =
    error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

  return (
    requestError.response?.data
      ?.message ||
    requestError.message ||
    "Failed to load assigned students"
  );
};

const getStatusTone = (
  status?: string,
) => {
  switch (status) {
    case "active":
    case "completed":
      return "green" as const;

    case "blocked":
      return "red" as const;

    default:
      return "amber" as const;
  }
};

export default function Page() {
  const router =
    useRouter();

  const [
    students,
    setStudents,
  ] = useState<Student[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    mentorName,
    setMentorName,
  ] = useState("");

  const [
    total,
    setTotal,
  ] = useState(0);

  const loadStudents =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await mentorService.students({
              search:
                search.trim() ||
                undefined,
            });

          const responseData =
            response.data.data;

          setStudents(
            responseData.students ||
              [],
          );

          setTotal(
            responseData.total ||
              0,
          );

          setMentorName(
            responseData.mentor
              ?.name ||
              "",
          );
        } catch (requestError) {
          setStudents([]);
          setTotal(0);

          setError(
            getErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [search],
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadStudents();
        },
        300,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [loadStudents]);

  const columns =
    useMemo<
      ColumnDef<Student>[]
    >(
      () => [
        {
          accessorKey:
            "registration_number",

          header:
            "Registration",

          cell: ({
            row,
          }) => (
            <div>
              <p className="font-semibold text-slate-900">
                {
                  row.original
                    .registration_number
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {row.original
                  .student_id ||
                  "-"}
              </p>
            </div>
          ),
        },

        {
          accessorKey: "name",
          header: "Student",

          cell: ({
            row,
          }) => (
            <div>
              <p className="font-semibold text-slate-900">
                {
                  row.original
                    .name
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {row.original
                  .email ||
                  row.original
                    .mobile ||
                  "-"}
              </p>
            </div>
          ),
        },

        {
          accessorKey:
            "programme",

          header:
            "Programme",

          cell: ({
            row,
          }) => (
            <div>
              <p>
                {row.original
                  .programme ||
                  "-"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {row.original
                  .major_subject ||
                  "-"}
              </p>
            </div>
          ),
        },

        {
          accessorKey:
            "session",

          header: "Session",

          cell: ({
            row,
          }) => (
            <div>
              <p>
                {row.original
                  .session ||
                  "-"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Semester{" "}
                {row.original
                  .semester ||
                  "-"}
              </p>
            </div>
          ),
        },

        {
          accessorKey:
            "payment_status",

          header: "Payment",

          cell: ({
            row,
          }) => (
            <Badge
              tone={
                row.original
                  .payment_status ===
                "paid"
                  ? "green"
                  : "amber"
              }
            >
              {String(
                row.original
                  .payment_status ||
                  "-",
              )}
            </Badge>
          ),
        },

        {
          accessorKey:
            "internship_status",

          header: "Status",

          cell: ({
            row,
          }) => (
            <Badge
              tone={getStatusTone(
                row.original
                  .internship_status,
              )}
            >
              {String(
                row.original
                  .internship_status ||
                  "-",
              )}
            </Badge>
          ),
        },

        {
          id: "actions",
          header: "Actions",

          cell: ({
            row,
          }) => (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  `/mentor/students/${row.original.id}`,
                )
              }
            >
              <Eye
                size={16}
                className="mr-2"
              />

              View
            </Button>
          ),
        },
      ],
      [router],
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Students"
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Logged-in mentor
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {mentorName ||
                "Mentor"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Total assigned
              students:{" "}
              <span className="font-semibold text-slate-800">
                {total}
              </span>
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() =>
              void loadStudents()
            }
          >
            <RefreshCcw
              size={16}
              className={`mr-2 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="relative max-w-lg">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              placeholder="Search by name, registration, email or mobile"
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
              Loading assigned
              students...
            </div>
          ) : error ? (
            <div className="flex min-h-48 flex-col items-center justify-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() =>
                  void loadStudents()
                }
              >
                Try Again
              </Button>
            </div>
          ) : students.length ===
            0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center">
              <p className="font-semibold text-slate-700">
                No assigned
                students found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Admin has not
                assigned any
                students to this
                mentor yet.
              </p>
            </div>
          ) : (
            <DataTable
              data={students}
              columns={columns}
            />
          )}
        </div>
      </div>
    </div>
  );
}