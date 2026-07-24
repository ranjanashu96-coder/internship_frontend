"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { adminService } from "@/lib/services";
import type { College } from "@/types";
import { Button, PageHeader } from "@/components/ui";

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(
    null,
  );

  const loadColleges = async () => {
    try {
      setLoading(true);

      const response = await adminService.colleges();

      setColleges(response.data.data.items);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Colleges load nahi ho sake",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const deleteCollege = async (id: number) => {
    const confirmed = window.confirm(
      "Kya aap is college ko delete karna chahte hain?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await adminService.deleteCollege(id);

      toast.success("College deleted successfully");

      setColleges((current) =>
        current.filter((college) => college.id !== id),
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "College delete nahi ho saka",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colleges"
        description="Manage partner colleges and their accounts."
        action={
          <Link href="/admin/colleges/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add College
            </Button>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : colleges.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <Building2 className="mb-3 h-10 w-10 text-slate-400" />

            <h2 className="font-semibold">
              No colleges found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first partner college.
            </p>

            <Link
              href="/admin/colleges/new"
              className="mt-4"
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add College
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    College
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    University
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Location
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Share
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {colleges.map((college) => (
                  <tr
                    key={college.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {college.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {college.code}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {college.university || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {[college.district, college.state]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <p>
                        College: {college.college_share}%
                      </p>

                      <p className="text-slate-500">
                        RKNexora:{" "}
                        {college.rknexora_share}%
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          college.status === "active"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {college.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/colleges/${college.id}/edit`}
                        >
                          <Button
                            type="button"
                            variant="secondary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          type="button"
                          variant="secondary"
                          disabled={
                            deletingId === college.id
                          }
                          onClick={() =>
                            deleteCollege(college.id)
                          }
                        >
                          {deletingId === college.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}