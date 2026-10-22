"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button, Input, PageHeader } from "@/components/ui";
import { adminService } from "@/lib/services";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.generatedDocuments({
        page,
        limit: 20,
        search: search.trim() || undefined,
        type: type || undefined,
      });
      
      const data = response.data.data;
      setDocuments(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments();
    }, 400);
    return () => clearTimeout(timer);
  }, [loadDocuments]);

  const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  
  const getDownloadUrl = (url?: string | null) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Generated Documents"
        description="View and download documents generated for all students."
      />

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student name or registration number..."
              className="pl-9"
            />
          </div>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
          >
            <option value="">All Document Types</option>
            <option value="certificate">Certificate</option>
            <option value="acceptance_letter">Offer Letter</option>
            <option value="attendance_sheet">Attendance Sheet</option>
            <option value="logbook">Logbook</option>
            <option value="assessment_marksheet">Marksheet</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Documents</h2>
          <span className="text-sm text-slate-500">{total} documents found</span>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No documents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Document Type</th>
                  <th className="p-4 font-semibold">Generated At</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{doc.student?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{doc.student?.registration_number}</p>
                      <p className="text-xs text-slate-500">{doc.student?.college?.name}</p>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {doc.type.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {doc.generated_at ? new Date(doc.generated_at).toLocaleString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={getDownloadUrl(doc.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-5 py-4">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </section>
    </div>
  );
}