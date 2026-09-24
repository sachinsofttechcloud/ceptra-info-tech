"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { getStoredUser } from "@/components/Auth/AuthGuard";
import { adminHeaders, API_URL, notifyCoursesChanged } from "@/lib/admin";

type MediaDraft = { name: string; url: string; extra: string };

const EMPTY_MEDIA = (): MediaDraft => ({ name: "", url: "", extra: "" });

const SAMPLE_EXCEL_DATA = [
  {
    title: "Salesforce LWC Masterclass 2026",
    slug: "salesforce-lwc-masterclass-2026",
    price: 20000,
    original_price: 24500,
    image: "/courses/new-course/5.webp",
    tags: "VIDEOS, FILES",
    badge: "NEW COURSE",
    pdfs: "Syllabus|/courses/docs/salesforce-course-syllabus.pdf|2.4 MB; Notes|/courses/docs/salesforce-study-notes.pdf|1.8 MB",
    videos: "LWC Overview|https://www.youtube.com/watch?v=EfK0SURQ8X0|12:30; Hands-on Components|https://www.youtube.com/watch?v=bDfOdFg5G1U|18:45",
  },
  {
    title: "Salesforce Admin Certification Course",
    slug: "salesforce-admin-certification-course",
    price: 15000,
    original_price: 18000,
    image: "/courses/new-course/1.webp",
    tags: "LIVE CLASS, CERTIFICATION",
    badge: "BEST SELLER",
    pdfs: "Exam Prep Guide|/courses/docs/salesforce-study-notes.pdf|2.1 MB",
    videos: "Admin Fundamentals|https://www.youtube.com/watch?v=EfK0SURQ8X0|15:00",
  },
];

const CSV_TEMPLATE = `title,slug,price,original_price,image,tags,badge,pdfs,videos
LWC Basics,lwc-basics,20000,24500,/courses/new-course/5.webp,"VIDEOS,FILES",NEW COURSE,Syllabus|/courses/docs/salesforce-course-syllabus.pdf|2.4 MB;Notes|/courses/docs/salesforce-study-notes.pdf|1.8 MB,Overview|https://www.youtube.com/watch?v=EfK0SURQ8X0|12:30;Hands on|https://www.youtube.com/watch?v=bDfOdFg5G1U&t=6s|18:45`;

export default function AdminCourseTools({
  nameFilter = "",
  onNameFilter,
}: {
  nameFilter?: string;
  onNameFilter?: (value: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"course" | "bulk" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [image, setImage] = useState("/courses/new-course/1.webp");
  const [tags, setTags] = useState("LIVE CLASS, VIDEOS, FILES");
  const [badge, setBadge] = useState("");
  const [pdfs, setPdfs] = useState<MediaDraft[]>([EMPTY_MEDIA(), EMPTY_MEDIA()]);
  const [videos, setVideos] = useState<MediaDraft[]>([EMPTY_MEDIA(), EMPTY_MEDIA()]);
  const [csvText, setCsvText] = useState("");

  const [excelPreview, setExcelPreview] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function downloadExcelTemplate() {
    try {
      const worksheet = XLSX.utils.json_to_sheet(SAMPLE_EXCEL_DATA, {
        header: [
          "title",
          "slug",
          "price",
          "original_price",
          "image",
          "tags",
          "badge",
          "pdfs",
          "videos",
        ],
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk_Courses");
      XLSX.writeFile(workbook, "courses_bulk_import_template.xlsx");
      setMessage("Excel sheet downloaded: courses_bulk_import_template.xlsx");
      setError("");
    } catch (err) {
      setError("Failed to generate Excel sheet template.");
    }
  }

  async function handleFileUpload(file: File) {
    try {
      setError("");
      setMessage("");
      setFileName(file.name);

      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        setCsvText(text);
        setExcelPreview([]);
        setMessage(`CSV file "${file.name}" loaded ready for import.`);
        return;
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json<any>(sheet);

      if (!parsedData || parsedData.length === 0) {
        throw new Error("No valid course rows found in the uploaded file.");
      }

      setExcelPreview(parsedData);
      setMessage(`Parsed ${parsedData.length} course(s) from "${file.name}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse file.");
      setExcelPreview([]);
    }
  }

  function updateMedia(
    kind: "pdf" | "video",
    index: number,
    field: keyof MediaDraft,
    value: string,
  ) {
    const setter = kind === "pdf" ? setPdfs : setVideos;
    setter((items) => items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  function addMedia(kind: "pdf" | "video") {
    const setter = kind === "pdf" ? setPdfs : setVideos;
    setter((items) => (items.length >= 4 ? items : [...items, EMPTY_MEDIA()]));
  }

  function removeMedia(kind: "pdf" | "video", index: number) {
    const setter = kind === "pdf" ? setPdfs : setVideos;
    setter((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveCourse(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/courses`, {
        method: "POST",
        headers: adminHeaders(getStoredUser()?.email),
        body: JSON.stringify({
          title,
          slug,
          price,
          originalPrice,
          image,
          tags,
          badge,
          pdfs: pdfs.filter((item) => item.name && item.url).map((item) => ({
            name: item.name,
            url: item.url,
            fileSize: item.extra,
          })),
          videos: videos.filter((item) => item.name && item.url).map((item) => ({
            name: item.name,
            url: item.url,
            duration: item.extra,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to save course.");
      setMessage("Course added to the course page.");
      setTitle("");
      setSlug("");
      setPrice("");
      setOriginalPrice("");
      setBadge("");
      setPdfs([EMPTY_MEDIA(), EMPTY_MEDIA()]);
      setVideos([EMPTY_MEDIA(), EMPTY_MEDIA()]);
      notifyCoursesChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function importBulkCourses(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      let bodyData: any = {};
      if (excelPreview.length > 0) {
        bodyData = { courses: excelPreview };
      } else if (csvText.trim()) {
        bodyData = { csv: csvText };
      } else {
        throw new Error("Please download & fill the Excel sheet template or upload a file first.");
      }

      const response = await fetch(`${API_URL}/api/courses/bulk`, {
        method: "POST",
        headers: adminHeaders(getStoredUser()?.email),
        body: JSON.stringify(bodyData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to import courses.");
      setMessage(data.message || "Bulk courses added successfully.");
      setExcelPreview([]);
      setCsvText("");
      setFileName("");
      notifyCoursesChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import courses.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-[#F7F6FF]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <label className="block w-full max-w-md">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Filter by course name
            </span>
            <input
              value={nameFilter}
              onChange={(event) => onNameFilter?.(event.target.value)}
              placeholder="Search a course"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#5B4FE0]"
            />
          </label>

          <div className="flex items-center gap-3 self-end">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center rounded-full border border-[#5B4FE0]/30 px-4 text-sm font-semibold text-[#5B4FE0]"
            >
              Admin
            </Link>
            <div
              ref={menuRef}
              className="relative"
              onMouseEnter={() => setMenuOpen(true)}
            >
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex h-11 items-center rounded-full bg-[#5B4FE0] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#4a3ec8] transition-colors"
              >
                Add course
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPanel("course");
                      setMenuOpen(false);
                      setError("");
                      setMessage("");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Add course
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanel("bulk");
                      setMenuOpen(false);
                      setError("");
                      setMessage("");
                      setExcelPreview([]);
                      setFileName("");
                    }}
                    className="block w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Add bulk courses
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {panel && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/40 backdrop-blur-xs">
          <form
            onSubmit={panel === "course" ? saveCourse : importBulkCourses}
            className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {panel === "course" ? "Add single course" : "Add bulk"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {panel === "course"
                    ? "These fields appear on the course card, with PDFs and videos."
                    : "Download the Excel sheet template with DB columns pre-filled, fill your courses, and upload."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanel(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-4 px-6 py-5">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{message}</span>
                </div>
              )}

              {panel === "course" ? (
                <>
                  <Field label="Course name" value={title} onChange={setTitle} required />
                  <Field label="Slug" value={slug} onChange={setSlug} placeholder="Generated from the name if empty" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price" value={price} onChange={setPrice} type="number" required />
                    <Field label="Original price" value={originalPrice} onChange={setOriginalPrice} type="number" />
                  </div>
                  <Field label="Image path" value={image} onChange={setImage} />
                  <Field label="Tags" value={tags} onChange={setTags} placeholder="VIDEOS, FILES" />
                  <Field label="Badge" value={badge} onChange={setBadge} />
                  <MediaEditor
                    title="PDF files"
                    hint="Add 2 to 4 PDFs"
                    items={pdfs}
                    extraLabel="File size"
                    onChange={(index, field, value) => updateMedia("pdf", index, field, value)}
                    onAdd={() => addMedia("pdf")}
                    onRemove={(index) => removeMedia("pdf", index)}
                  />
                  <MediaEditor
                    title="Videos"
                    hint="Add 2 to 4 videos"
                    items={videos}
                    extraLabel="Duration"
                    onChange={(index, field, value) => updateMedia("video", index, field, value)}
                    onAdd={() => addMedia("video")}
                    onRemove={(index) => removeMedia("video", index)}
                  />
                </>
              ) : (
                <div className="space-y-5">
                  {/* Step 1: Download Excel Sheet Template */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                          <span>Step 1: Download Excel Sheet Template</span>
                        </div>
                        <p className="mt-1 text-xs text-emerald-700">
                          Download an formatted Excel (.xlsx) file containing all required database columns (title, slug, price, original_price, image, tags, badge, pdfs, videos) with sample entries.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadExcelTemplate}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Excel Sheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Fill and Upload Excel File */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                      <Upload className="h-5 w-5 text-[#5B4FE0]" />
                      <span>Step 2: Upload Filled Excel Sheet (.xlsx / .xls / .csv)</span>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white hover:bg-slate-100/60 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-7 h-7 mb-2 text-slate-400" />
                        <p className="mb-1 text-xs text-slate-600">
                          <span className="font-semibold text-[#5B4FE0]">Click to upload Excel sheet</span> or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-400">Supports .xlsx, .xls, or .csv files</p>
                        {fileName && (
                          <p className="mt-2 text-xs font-bold text-emerald-600">
                            Selected file: {fileName}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview Table if Excel file parsed */}
                  {excelPreview.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Parsed Courses Preview ({excelPreview.length} items ready)
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold">Ready to save to database</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2">#</th>
                              <th className="px-3 py-2">Title</th>
                              <th className="px-3 py-2">Slug</th>
                              <th className="px-3 py-2">Price</th>
                              <th className="px-3 py-2">Tags</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {excelPreview.map((item, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-bold text-slate-400">{i + 1}</td>
                                <td className="px-3 py-2 font-semibold text-slate-800">{item.title || item.Title || "N/A"}</td>
                                <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{item.slug || item.Slug || "auto"}</td>
                                <td className="px-3 py-2 font-bold text-emerald-600">₹{item.price || item.Price || 0}</td>
                                <td className="px-3 py-2 text-[11px] text-slate-500">{item.tags || item.Tags || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Fallback CSV Textarea */}
                  <details className="text-xs">
                    <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800 mb-2">
                      Or paste raw CSV text directly (Advanced)
                    </summary>
                    <textarea
                      value={csvText}
                      onChange={(event) => {
                        setCsvText(event.target.value);
                        setExcelPreview([]);
                      }}
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs outline-none focus:border-[#5B4FE0]"
                      placeholder="Paste CSV content here"
                    />
                  </details>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                type="submit"
                disabled={saving}
                className="h-11 w-full rounded-full bg-[#5B4FE0] text-sm font-semibold text-white shadow-md disabled:opacity-60 hover:bg-[#4a3ec8] transition-colors"
              >
                {saving
                  ? "Importing to Database..."
                  : panel === "course"
                    ? "Save course"
                    : excelPreview.length > 0
                      ? `Import ${excelPreview.length} Courses to Database`
                      : "Import Courses to Database"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#5B4FE0]"
      />
    </label>
  );
}

function MediaEditor({
  title,
  hint,
  items,
  extraLabel,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  items: MediaDraft[];
  extraLabel: string;
  onChange: (index: number, field: keyof MediaDraft, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">{hint}</p>
        </div>
        <button type="button" onClick={onAdd} className="text-xs font-bold text-[#5B4FE0]">
          Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3">
            <input
              value={item.name}
              onChange={(event) => onChange(index, "name", event.target.value)}
              placeholder="Name"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
            <input
              value={item.url}
              onChange={(event) => onChange(index, "url", event.target.value)}
              placeholder="URL"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            />
            <div className="flex gap-2">
              <input
                value={item.extra}
                onChange={(event) => onChange(index, "extra", event.target.value)}
                placeholder={extraLabel}
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              />
              <button type="button" onClick={() => onRemove(index)} className="text-xs font-semibold text-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
