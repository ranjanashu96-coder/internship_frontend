"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { adminService } from "@/lib/services";
import type { Mentor } from "@/types";
import { Button, PageHeader } from "@/components/ui";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const loadMentors = async () => {
    try {
      setLoading(true);

      const response = await adminService.mentors({
        page: 1,
        limit: 100,
      });

      setMentors(response.data.data.items);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Mentors could not be loaded",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
  }, []);

  const deleteMentor = async (id: number) => {
    const confirmed = window.confirm(
      "Do you want to delete this mentor?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await adminService.deleteMentor(id);

      setMentors((current) =>
        current.filter((mentor) => mentor.id !== id),
      );

      toast.success("Mentor deleted successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Mentor could not be deleted",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentors"
        description="Manage mentor profiles and login accounts."
        action={
          <Link href="/admin/mentors/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Mentor
            </Button>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <UserRound className="mb-3 h-10 w-10 text-slate-400" />

            <h2 className="font-semibold">
              No mentors found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first mentor.
            </p>

            <Link
              href="/admin/mentors/new"
              className="mt-4"
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Mentor
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Mentor
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Employee ID
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    College
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Domain
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Contact
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
                {mentors.map((mentor: any) => (
                  <tr
                    key={mentor.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {mentor.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {mentor.designation || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {mentor.employee_id}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {mentor.college?.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {mentor.domain?.domain_name || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <p>{mentor.email}</p>
                      <p className="text-slate-500">
                        {mentor.mobile || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          mentor.status === "active"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {mentor.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                       <Link
  href={`/admin/mentors/${mentor.id}/assign-students`}
  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
>
  <UserPlus size={15} />
  Assign Students
</Link>
                        
                        <Link
                          href={`/admin/mentors/${mentor.id}/edit`}
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
                          disabled={deletingId === mentor.id}
                          onClick={() =>
                            deleteMentor(mentor.id)
                          }
                        >
                          {deletingId === mentor.id ? (
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