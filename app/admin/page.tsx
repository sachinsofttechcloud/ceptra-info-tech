"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/components/Auth/AuthGuard";
import { adminHeaders, API_URL, isAdminEmail } from "@/lib/admin";

const TABS = [
  { id: "logins", label: "Login data" },
  { id: "signups", label: "Signup data" },
  { id: "courses", label: "Course data" },
  { id: "payments", label: "Payment data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type PageData = {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  totalPages: number;
};

const COLUMNS: Record<TabId, { key: string; label: string }[]> = {
  logins: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "created_at", label: "Logged in" },
  ],
  signups: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "last_login_at", label: "Last login" },
    { key: "created_at", label: "Signed up" },
  ],
  courses: [
    { key: "title", label: "Course" },
    { key: "groupType", label: "Section" },
    { key: "price", label: "Price" },
    { key: "pdfs", label: "PDFs" },
    { key: "videos", label: "Videos" },
  ],
  payments: [
    { key: "student_name", label: "Student" },
    { key: "student_email", label: "Email" },
    { key: "course_title", label: "Course" },
    { key: "amount", label: "Amount" },
    { key: "transaction_id", label: "Transaction" },
    { key: "status", label: "Status" },
  ],
};

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabId>("logins");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageData>({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!isAdminEmail(user?.email)) {
      setAllowed(false);
      router.replace("/courses");
      return;
    }
    setAllowed(true);
  }, [router]);

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const user = getStoredUser();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ q: query, page: String(page), pageSize: "8" });
    fetch(`${API_URL}/api/admin/${tab}?${params}`, {
      headers: adminHeaders(user?.email),
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to load records.");
        setData(payload);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load records.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [allowed, tab, query, page]);

  if (allowed !== true) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Checking admin access...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#5B4FE0]">Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Ceptra records</h1>
        </div>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder={`Filter ${TABS.find((item) => item.id === tab)?.label.toLowerCase()}`}
          className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#5B4FE0] sm:w-72"
        />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setPage(1);
              setSelected(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item.id ? "bg-[#5B4FE0] text-white" : "bg-slate-100 text-slate-600"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {error && <p className="px-5 py-4 text-sm text-red-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {COLUMNS[tab].map((column) => (
                  <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>
                ))}
                <th className="px-4 py-3 font-semibold">Entity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan={COLUMNS[tab].length + 1}>Loading records...</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td className="px-4 py-8 text-slate-500" colSpan={COLUMNS[tab].length + 1}>No records match this filter.</td></tr>
              ) : data.items.map((item, index) => (
                <tr key={String(item.id || item.transaction_id || index)} className="border-t border-slate-100">
                  {COLUMNS[tab].map((column) => (
                    <td key={column.key} className="max-w-56 truncate px-4 py-3 text-slate-700">
                      {formatCell(item[column.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelected(item)} className="font-semibold text-[#5B4FE0]">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
          <span className="text-slate-500">{data.total} records</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-slate-200 px-3 py-1.5 disabled:opacity-40">
              Previous
            </button>
            <span className="text-slate-600">{data.page} / {data.totalPages}</span>
            <button type="button" disabled={page >= data.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-slate-200 px-3 py-1.5 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/40">
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Record details</h2>
              <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-slate-500">Close</button>
            </div>
            <dl className="mt-5 space-y-4">
              {Object.entries(selected).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{key}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{formatCell(value)}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      )}
    </section>
  );
}

function formatCell(value: unknown) {
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  if (value == null || value === "") return "—";
  const text = String(value);
  const date = Date.parse(text);
  if (text.includes("T") && !Number.isNaN(date)) return new Date(text).toLocaleString("en-IN");
  return text;
}
