"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/components/Auth/AuthGuard";
import { adminHeaders, API_URL, isAdminEmail } from "@/lib/admin";
import AdminCourseTools from "@/components/Layout/AdminCourseTools";

const TABS = [
  { id: "logins", label: "Login data" },
  { id: "signups", label: "Signup data" },
  { id: "courses", label: "Course data" },
  { id: "payments", label: "Payment data" },
  { id: "acknowledgements", label: "Terms Acknowledgements" },
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
  acknowledgements: [
    { key: "student_name", label: "Student Name" },
    { key: "course_name", label: "Course Name" },
    { key: "mobile_number", label: "Mobile" },
    { key: "date", label: "Signed Date" },
    { key: "created_at", label: "Submitted At" },
  ],
};

export default function AdminClient() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabId>("logins");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageData>({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getStoredUser();
    if (!u || !isAdminEmail(u.email)) {
      setAllowed(false);
      router.replace("/");
    } else {
      setAllowed(true);
    }
  }, [router]);

  useEffect(() => {
    if (allowed !== true) return;
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      query: query.trim(),
    });

    fetch(`${API_URL}/api/admin/${tab}?${params.toString()}`, {
      headers: adminHeaders(),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("unauthorized");
        }
        return res.json();
      })
      .then((resData) => {
        if (cancelled) return;
        if (resData.success) {
          setData({
            items: resData.items || [],
            total: resData.total || 0,
            page: resData.page || 1,
            totalPages: resData.totalPages || 1,
          });
        }
      })
      .catch((err) => {
        if (err.message === "unauthorized") {
          router.replace("/");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [allowed, tab, page, query, router]);

  useEffect(() => {
    const handleCoursesChange = () => {
      if (tab === "courses") {
        setPage(1);
      }
    };
    window.addEventListener("ceptra_courses_change", handleCoursesChange);
    return () => window.removeEventListener("ceptra_courses_change", handleCoursesChange);
  }, [tab]);

  if (allowed === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 text-slate-500">
        Checking access...
      </div>
    );
  }

  if (!allowed) return null;

  const cols = COLUMNS[tab];

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
            <p className="text-sm text-slate-600">
              Manage users, track activity, courses and payments
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="self-start rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:self-auto"
          >
            Back to site
          </button>
        </header>

        <div className="flex border-b border-slate-200 bg-white px-2 pt-2 rounded-t-xl overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "border-violet-600 text-violet-700 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "courses" && <AdminCourseTools />}

        <div className="space-y-4 rounded-b-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              placeholder="Search records..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <span className="text-xs text-slate-500">
              Total records: {data.total}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  {cols.map((c) => (
                    <th key={c.key} className="px-4 py-3">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={cols.length} className="p-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : data.items.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length} className="p-8 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  data.items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      {cols.map((c) => {
                        const val = row[c.key];
                        let formatted = String(val ?? "-");

                        if (c.key === "price" && (typeof val === "number" || typeof val === "string")) {
                          const num = Number(val);
                          formatted = !isNaN(num) ? `₹${num.toLocaleString("en-IN")}` : String(val);
                        } else if ((c.key === "pdfs" || c.key === "videos") && Array.isArray(val)) {
                          formatted = val.length > 0 ? `${val.length} item(s)` : "-";
                        } else if (c.key.endsWith("_at") && typeof val === "string") {
                          try {
                            formatted = new Date(val).toLocaleString();
                          } catch {
                            // keep raw
                          }
                        }

                        return (
                          <td key={c.key} className="px-4 py-3 whitespace-nowrap">
                            {formatted}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
