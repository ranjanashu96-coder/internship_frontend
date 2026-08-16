"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, RefreshCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Input, PageHeader } from "@/components/ui";
import { adminService, type AdminPaymentRow, type AdminPaymentsData } from "@/lib/services";

const emptySummary: AdminPaymentsData["summary"] = { total: 0, created: 0, success: 0, failed: 0 };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRow | null>(null);
  const [editingPayment, setEditingPayment] = useState<AdminPaymentRow | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.payments({ page, limit: 20, search: search.trim() || undefined, status: status || undefined });
      const data = response.data.data;
      setPayments(data.items || []);
      setSummary(data.summary || emptySummary);
      setTotal(Number(data.total || 0));
      setTotalPages(Math.max(1, Number(data.totalPages || 1)));
    } catch (error: any) {
      setPayments([]);
      toast.error(error?.response?.data?.message ?? "Unable to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPayments(), 350);
    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  const markAsPaid = async (payment: AdminPaymentRow) => {
    if (payment.status !== "created") return toast.error("Only created payment can be updated");

    const reason = window.prompt(
      `Payment #${payment.id} को paid करने का reason लिखें:`,
      "Payment received but gateway webhook status was not updated",
    );
    if (reason === null) return;
    if (reason.trim().length < 10) return toast.error("Reason must be at least 10 characters");

    if (!window.confirm(`क्या आपने gateway/bank में ₹${formatAmount(payment.amount)} payment verify कर लिया है?`)) return;

    try {
      setUpdatingId(payment.id);
      const response = await adminService.markPaymentSuccessful(payment.id, reason.trim());
      toast.success(response.data.message || "Payment updated successfully");
      setSelectedPayment(null);
      await loadPayments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Payment could not be updated");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Management"
        description="View all payments and student statuses. Only created payments can be marked successful."
        action={<Button type="button" variant="secondary" onClick={() => void loadPayments()}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Payments" value={summary.total} tone="blue" />
        <SummaryCard label="Created" value={summary.created} tone="amber" />
        <SummaryCard label="Successful" value={summary.success} tone="green" />
        <SummaryCard label="Failed" value={summary.failed} tone="red" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Student, registration, transaction or order ID..." className="pl-9" />
          </div>
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500">
            <option value="">All payment statuses</option>
            <option value="created">Created</option><option value="pending">Pending</option><option value="processing">Processing</option>
            <option value="success">Success</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
          </select>
          {(search || status) && <Button type="button" variant="secondary" onClick={() => { setSearch(""); setStatus(""); setPage(1); }}><X className="mr-2 h-4 w-4" />Clear</Button>}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div><h2 className="font-semibold text-slate-900">All payments</h2><p className="text-sm text-slate-500">{total.toLocaleString()} records found</p></div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
        </div>

        {loading && payments.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center"><AlertCircle className="mb-3 h-10 w-10 text-slate-400" /><h3 className="font-semibold">No payments found</h3></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1460px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr>
                <th className="px-4 py-3">ID / Gateway</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Amount / Status</th>
                <th className="px-4 py-3">Transaction & Order IDs</th><th className="px-4 py-3">Gateway Payment IDs</th><th className="px-4 py-3">Method / Date</th>
                <th className="px-4 py-3">Receipt</th><th className="px-4 py-3">Student Status</th><th className="px-4 py-3 text-right">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">{payments.map((payment) => (
                <tr key={payment.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-4"><p className="font-semibold">#{payment.id}</p><p className="mt-1 capitalize text-slate-500">{payment.gateway || "—"}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold">{payment.student?.name || "Unknown student"}</p><p className="mt-1 text-xs text-slate-500">{payment.student?.registration_number || "—"}</p><p className="text-xs text-slate-400">Student ID: {payment.student_id}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold">₹{formatAmount(payment.amount)}</p><div className="mt-2"><PaymentStatusBadge status={payment.status} /></div></td>
                  <td className="max-w-[310px] px-4 py-4 text-xs"><IdLine label="Transaction" value={payment.transaction_id} /><IdLine label="Order" value={payment.order_id} /><IdLine label="Cashfree" value={payment.cashfree_order_id} /><IdLine label="CF Order" value={payment.cf_order_id} /><IdLine label="Razorpay" value={payment.razorpay_order_id} /></td>
                  <td className="max-w-[250px] px-4 py-4 text-xs"><IdLine label="CF Payment" value={payment.cf_payment_id} /><IdLine label="RZP Payment" value={payment.razorpay_payment_id} /></td>
                  <td className="px-4 py-4"><p className="capitalize">{payment.payment_method || "—"}</p><p className="mt-1 text-xs text-slate-500">{formatDate(payment.paid_at || payment.created_at || payment.createdAt)}</p>{payment.payment_message && <p className="mt-1 max-w-[180px] text-xs text-slate-400">{payment.payment_message}</p>}</td>
                  <td className="px-4 py-4"><p className="font-medium">{payment.receipt_number || "Not generated"}</p>{payment.receipt_generated_at && <p className="mt-1 text-xs text-slate-500">{formatDate(payment.receipt_generated_at)}</p>}</td>
                  <td className="px-4 py-4"><div className="space-y-2"><Badge tone={payment.student?.payment_status === "paid" ? "green" : "slate"}>{payment.student?.payment_status || "unknown"}</Badge><div><Badge tone={payment.student?.internship_status === "active" ? "blue" : "slate"}>{payment.student?.internship_status || "unknown"}</Badge></div></div></td>
                  <td className="px-4 py-4 text-right"><div className="flex justify-end gap-2"><Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setSelectedPayment(payment)}>Details</Button><Button type="button" variant="secondary" className="h-9 px-3 text-xs" onClick={() => setEditingPayment(payment)}>Edit</Button>{payment.status === "created" && <Button type="button" className="h-9 whitespace-nowrap px-3 text-xs" disabled={updatingId === payment.id} onClick={() => void markAsPaid(payment)}>{updatingId === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}Mark Paid</Button>}</div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between"><p className="text-sm text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((v) => Math.max(1, v - 1))}><ChevronLeft className="mr-1 h-4 w-4" />Previous</Button>
        <Button type="button" variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage((v) => Math.min(totalPages, v + 1))}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button>
      </div></div>

      {selectedPayment && <PaymentDetailsModal payment={selectedPayment} updating={updatingId === selectedPayment.id} onClose={() => setSelectedPayment(null)} onMarkPaid={() => void markAsPaid(selectedPayment)} />}
      {editingPayment && <PaymentEditModal payment={editingPayment} onClose={() => setEditingPayment(null)} onSaved={async () => { setEditingPayment(null); await loadPayments(); }} />}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "blue" | "amber" | "green" | "red" }) {
  const styles = { blue: "border-blue-200 bg-blue-50 text-blue-700", amber: "border-amber-200 bg-amber-50 text-amber-700", green: "border-emerald-200 bg-emerald-50 text-emerald-700", red: "border-red-200 bg-red-50 text-red-700" }[tone];
  return <div className={`rounded-2xl border p-5 ${styles}`}><p className="text-sm font-medium">{label}</p><p className="mt-2 text-3xl font-bold">{value.toLocaleString()}</p></div>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const tone: "green" | "blue" | "amber" | "red" | "slate" = ["success", "paid"].includes(status) ? "green" : status === "created" ? "amber" : ["pending", "processing"].includes(status) ? "blue" : status === "failed" ? "red" : "slate";
  return <Badge tone={tone}>{status}</Badge>;
}

function IdLine({ label, value }: { label: string; value?: string | null }) { return <p className="mb-1 break-all text-slate-600"><span className="font-semibold text-slate-800">{label}:</span> {value || "—"}</p>; }
function formatAmount(value: number | string) { return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatDate(value?: string | null) { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-IN"); }

function PaymentDetailsModal({ payment, updating, onClose, onMarkPaid }: { payment: AdminPaymentRow; updating: boolean; onClose: () => void; onMarkPaid: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
    <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4"><div><h2 className="text-lg font-semibold">Payment #{payment.id}</h2><p className="text-sm text-slate-500">Complete payment and student details</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
    <div className="grid gap-4 p-6 sm:grid-cols-2"><Detail label="Student" value={payment.student?.name} /><Detail label="Registration Number" value={payment.student?.registration_number} /><Detail label="Payment Status" value={payment.status} /><Detail label="Student Payment Status" value={payment.student?.payment_status} /><Detail label="Amount" value={`₹${formatAmount(payment.amount)}`} /><Detail label="Gateway" value={payment.gateway} /><Detail label="Transaction ID" value={payment.transaction_id} /><Detail label="Order ID" value={payment.order_id} /><Detail label="Cashfree Order ID" value={payment.cashfree_order_id} /><Detail label="CF Order ID" value={payment.cf_order_id} /><Detail label="CF Payment ID" value={payment.cf_payment_id} /><Detail label="Razorpay Order ID" value={payment.razorpay_order_id} /><Detail label="Razorpay Payment ID" value={payment.razorpay_payment_id} /><Detail label="Payment Method" value={payment.payment_method} /><Detail label="Payment Message" value={payment.payment_message} /><Detail label="Failure Reason" value={payment.failure_reason} /><Detail label="Paid At" value={formatDate(payment.paid_at)} /><Detail label="Receipt Number" value={payment.receipt_number} /><Detail label="Receipt Path" value={payment.receipt_path} /><Detail label="Receipt Generated" value={formatDate(payment.receipt_generated_at)} /></div>
    <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4"><Button type="button" variant="secondary" onClick={onClose}>Close</Button>{payment.status === "created" && <Button type="button" disabled={updating} onClick={onMarkPaid}>{updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Mark as Paid</Button>}</div>
  </div></div>;
}

function Detail({ label, value }: { label: string; value?: string | number | null }) { return <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-medium uppercase text-slate-400">{label}</p><p className="mt-1 break-all text-sm font-medium text-slate-800">{value === null || value === undefined || value === "" ? "—" : String(value)}</p></div>; }

const editableFields = [
  ["transaction_id", "Transaction ID"], ["amount", "Amount"], ["gateway", "Gateway"], ["currency", "Currency"],
  ["order_id", "Order ID"], ["cashfree_order_id", "Cashfree Order ID"], ["cf_order_id", "CF Order ID"],
  ["cf_payment_id", "CF Payment ID"], ["razorpay_order_id", "Razorpay Order ID"], ["razorpay_payment_id", "Razorpay Payment ID"],
  ["razorpay_signature", "Razorpay Signature"], ["payment_method", "Payment Method"], ["payment_message", "Payment Message"],
  ["failure_reason", "Failure Reason"], ["paid_at", "Paid At"], ["receipt_path", "Receipt Path"],
  ["receipt_number", "Receipt Number"], ["receipt_generated_at", "Receipt Generated At"],
] as const;

function PaymentEditModal({ payment, onClose, onSaved }: { payment: AdminPaymentRow; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const data: Record<string, string> = { status: payment.status, gateway_payload: typeof payment.gateway_payload === "string" ? payment.gateway_payload : JSON.stringify(payment.gateway_payload || {}, null, 2) };
    editableFields.forEach(([key]) => { data[key] = String(payment[key] ?? ""); });
    return data;
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);
      await adminService.updatePayment(payment.id, { ...form, amount: Number(form.amount), gateway_payload: form.gateway_payload ? JSON.parse(form.gateway_payload) : {} });
      toast.success("Payment updated successfully");
      await onSaved();
    } catch (error: any) {
      toast.error(error instanceof SyntaxError ? "Gateway payload is not valid JSON" : error?.response?.data?.message ?? "Payment update failed");
    } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4"><div><h2 className="text-lg font-semibold">Edit Payment #{payment.id}</h2><p className="text-sm text-slate-500">Student link cannot be changed</p></div><button type="button" onClick={onClose}><X className="h-5 w-5" /></button></div>
    <div className="grid gap-4 p-6 md:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Status<select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border px-3"><option value="created">Created</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="success">Success</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label>
      {editableFields.map(([key, label]) => <label key={key} className="text-sm font-medium text-slate-700">{label}<Input type={key === "amount" ? "number" : key.includes("_at") ? "datetime-local" : "text"} value={form[key] || ""} onChange={(e) => setForm((v) => ({ ...v, [key]: e.target.value }))} className="mt-1" /></label>)}
      <label className="text-sm font-medium text-slate-700 md:col-span-2">Gateway Payload JSON<textarea rows={8} value={form.gateway_payload} onChange={(e) => setForm((v) => ({ ...v, gateway_payload: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs" /></label>
    </div>
    <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" disabled={saving} onClick={() => void save()}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button></div>
  </div></div>;
}
