"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Folder,
  ImageIcon,
  Lock,
  PlayCircle,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react";
import AuthGuard, { getStoredUser } from "@/components/Auth/AuthGuard";
import Link from "next/link";
import { API_URL } from "@/lib/admin";
import { emailError, mobileError } from "@/lib/validation";

export interface CourseContentItem {
  id?: string;
  type: "video" | "pdf";
  name: string;
  url: string;
  duration?: string;
  fileSize?: string;
  description?: string;
}

export interface CourseListItem {
  slug: string;
  title: string;
  image: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  badge?: string;
  href: string;
  category?: "live" | "interview-readiness" | "recorded";
  popularity?: number;
  dateAdded?: string;
  content?: CourseContentItem[];
  description?: {
    about: string;
    sections: { heading: string; points: string[] }[];
  };
}

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const ACCENT = "#5B4FE0";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

type PurchaseStep = null | "locked" | "details" | "payment" | "unlocked" | "success";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error?: { description?: string };
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: "payment.failed", handler: (payload: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill: { name?: string; email?: string; contact?: string };
      theme?: { color: string };
      handler: (response: RazorpaySuccess) => void;
      modal?: { ondismiss?: () => void };
    }) => RazorpayCheckout;
  }
}

function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      window.clearTimeout(timeout);
      resolve(ok);
    };
    const timeout = window.setTimeout(() => done(false), 8000);
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => done(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => done(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => done(Boolean(window.Razorpay));
    script.onerror = () => done(false);
    document.body.appendChild(script);
  });
}


function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let videoId = "";
  let startSeconds = 0;

  // Extract start time if any (e.g. t=6s or t=6 or start=6)
  const timeMatch = url.match(/[?&](?:t|start)=(\d+)(?:s)?/i);
  if (timeMatch && timeMatch[1]) {
    startSeconds = parseInt(timeMatch[1], 10);
  }

  // Extract video ID from various YouTube URL formats
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  if (match && match[1]) {
    videoId = match[1];
  } else if (url.includes("youtube.com/embed/")) {
    return url;
  }

  if (!videoId) return null;

  const startParam = startSeconds > 0 ? `&start=${startSeconds}` : "";
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${startParam}`;
}

export default function CourseDetailClient({
  course: initialCourse,
  catalogBacked = true,
}: {
  course: CourseListItem;
  catalogBacked?: boolean;
}) {
  const [course, setCourse] = useState(initialCourse);
  const [missingCourse, setMissingCourse] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "content">(
    "overview",
  );
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    state: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: current.email || user.email || "",
    }));
  }, []);

  const [purchased, setPurchased] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [viewerItem, setViewerItem] = useState<CourseContentItem | null>(null);

  const [contentList, setContentList] = useState<CourseContentItem[]>(
    initialCourse.content && initialCourse.content.length > 0
      ? initialCourse.content
      : [],
  );
  const [contentStatus, setContentStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/courses/${encodeURIComponent(initialCourse.slug)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload?.success || !payload.course) {
          throw new Error(payload?.message || "Course not found.");
        }
        return payload.course as {
          title?: string;
          image?: string;
          tags?: string[];
          price?: number;
          originalPrice?: number;
          badge?: string;
          pdfs?: CourseContentItem[];
          videos?: CourseContentItem[];
        };
      })
      .then((remote) => {
        if (cancelled) return;
        const videos = (remote.videos || []).map((item, index) => ({
          ...item,
          id: item.id || `video-${index + 1}`,
          type: "video" as const,
        }));
        const pdfs = (remote.pdfs || []).map((item, index) => ({
          ...item,
          id: item.id || `pdf-${index + 1}`,
          type: "pdf" as const,
        }));
        setCourse((current) => ({
          ...current,
          title: remote.title || current.title,
          image: remote.image || current.image,
          tags: remote.tags?.length ? remote.tags : current.tags,
          price: remote.price ?? current.price,
          originalPrice: remote.originalPrice ?? current.originalPrice,
          badge: remote.badge || current.badge,
          content: [...videos, ...pdfs],
        }));
        setContentList([...videos, ...pdfs]);
        setContentStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Client course fetch notice:", err);
        if (!catalogBacked && (!initialCourse.title || initialCourse.price === 0)) {
          setMissingCourse(true);
        }
        setContentList(initialCourse.content?.length ? initialCourse.content : []);
        setContentStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [catalogBacked, initialCourse]);

  const videoCount = contentList.filter((i) => i.type === "video").length;
  const pdfCount = contentList.filter((i) => i.type === "pdf").length;

  useEffect(() => {
    let cancelled = false;
    const user = getStoredUser();
    const params = new URLSearchParams({ courseSlug: course.slug });
    if (user?.email) params.set("email", user.email);

    const localBefore = window.localStorage.getItem(`purchased_${course.slug}`);
    fetch(`${API_URL}/api/payments/access?${params.toString()}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.message || "Unable to check purchase.");
        return payload as { purchased?: boolean; paymentId?: string };
      })
      .then((payload) => {
        if (cancelled) return;
        if (payload.purchased && payload.paymentId) {
          setPurchased(true);
          setTxnId(payload.paymentId);
          window.localStorage.setItem(`purchased_${course.slug}`, payload.paymentId);
          return;
        }
        const localNow = window.localStorage.getItem(`purchased_${course.slug}`);
        if (localNow && localNow !== localBefore) return;
        window.localStorage.removeItem(`purchased_${course.slug}`);
        setPurchased(false);
        setTxnId("");
      })
      .catch(() => {
        if (cancelled) return;
        const saved = window.localStorage.getItem(`purchased_${course.slug}`);
        if (saved) {
          setPurchased(true);
          setTxnId(saved);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [course.slug]);

  const hasDiscount =
    !!course.originalPrice && course.originalPrice > course.price;
  const discount = hasDiscount
    ? Math.round(
      ((course.originalPrice! - course.price) / course.originalPrice!) * 100,
    )
    : 0;

  // ---- customer details validation ----
  const errors = {
    fullName: form.fullName.trim().length < 2 ? "Enter your full name" : "",
    mobile: mobileError(form.mobile),
    email: emailError(form.email),
    state: !form.state ? "Select your state" : "",
  };
  const isFormValid =
    !errors.fullName && !errors.mobile && !errors.email && !errors.state;

  const markTouched = (field: string) =>
    setTouched((t) => ({ ...t, [field]: true }));

  function closeAllModals() {
    setPurchaseStep(null);
    setPaymentError(null);
  }

  function openBuyFlow() {
    if (purchased) {
      setActiveTab("content");
      setFolderOpen(true);
      return;
    }
    setPurchaseStep("locked");
  }

  function handleProceedToPayment() {
    setTouched({
      fullName: true,
      mobile: true,
      email: true,
      state: true,
    });
    if (!isFormValid) return;
    setPaymentError(null);
    setPurchaseStep("payment");
  }

  async function startRazorpayCheckout() {
    if (!isFormValid || isProcessingPayment) return;
    if (!Number.isInteger(course.price) || course.price < 1) {
      setPaymentError("This course is not available for online payment.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const account = getStoredUser();
      if (!account?.email) {
        throw new Error("Sign in before paying for this course.");
      }

      const scriptReady = await loadRazorpayCheckout();
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Check your connection and try again.");
      }

      const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: course.slug,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          state: form.state,
          accountEmail: account.email,
        }),
      });
      const orderData = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok || !orderData.success || !orderData.orderId || !orderData.keyId) {
        throw new Error(orderData.message || "Could not create the Razorpay order.");
      }

      const RazorpayCheckout = window.Razorpay;
      const checkout = new RazorpayCheckout({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Ceptra Infotech",
        description: orderData.courseTitle || course.title,
        order_id: orderData.orderId,
        prefill: {
          name: form.fullName.trim(),
          email: form.email.trim() || account.email,
          contact: form.mobile.trim(),
        },
        theme: { color: ACCENT },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyResponse.json().catch(() => ({}));
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed.");
            }

            const paymentId = verifyData.paymentId || response.razorpay_payment_id;
            const destination = verifyData.smsSent
              ? `your mobile ${form.mobile}`
              : verifyData.emailSent
                ? form.email.trim()
                : "";
            window.localStorage.setItem(`purchased_${course.slug}`, paymentId);
            setTxnId(paymentId);
            setPurchased(true);
            setPaymentError(null);
            setPaymentNotice(
              destination
                ? `${verifyData.message || "Congratulations! Your payment is successful."} Sent to ${destination}.`
                : verifyData.message || "Congratulations! Your payment is successful."
            );
            setPurchaseStep("unlocked");
            window.setTimeout(() => {
              setPurchaseStep(null);
              setActiveTab("content");
              setFolderOpen(true);
            }, 4000);
          } catch (error) {
            setPaymentNotice(null);
            setPurchaseStep("payment");
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Payment failed. Choose Razorpay and try again."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setPurchaseStep("payment");
          },
        },
      });

      checkout.on("payment.failed", (failed) => {
        setPaymentNotice(null);
        setPurchaseStep("payment");
        setPaymentError(failed?.error?.description || "Payment failed. Please try Razorpay again.");
        setIsProcessingPayment(false);
      });
      checkout.open();
    } catch (error) {
      setPurchaseStep("payment");
      setPaymentError(
        error instanceof Error ? error.message : "Unable to start Razorpay checkout."
      );
      setIsProcessingPayment(false);
    }
  }

  function openContentItem(item: CourseContentItem) {
    if (purchased) {
      setViewerItem(item);
    } else {
      setPurchaseStep("locked");
    }
  }

  if (missingCourse) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Course not found</h1>
        <Link href="/courses" className="mt-4 inline-flex text-sm font-semibold text-[#5B4FE0]">
          Back to courses
        </Link>
      </section>
    );
  }

  return (
    <AuthGuard>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link_Back />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* ---------------- MAIN COLUMN ---------------- */}
          <div>
            <h1
              className="text-lg font-bold text-slate-900 sm:text-xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {course.title}*
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">Salesforce</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-500">
                <FileText className="h-3 w-3" /> {pdfCount} PDFS
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-pink-50 px-2 py-1 text-[10px] font-semibold text-pink-500">
                <ImageIcon className="h-3 w-3" /> {videoCount} VIDEOS
              </span>
            </div>

            {/* ---- Tabs ---- */}
            <div className="mt-5 flex gap-6 border-b border-slate-200">
              {(["overview", "content"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b-2 pb-2 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === tab
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {tab === "overview" ? "Overview" : "Content"}
                </button>
              ))}
            </div>

            {/* ---- OVERVIEW TAB ---- */}
            {activeTab === "overview" && (
              <div className="mt-5 space-y-5 md:min-w-184.5">
                <div className="rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-bold text-slate-900">
                    About This Course
                  </h2>

                  {course.description ? (
                    <>
                      <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                        {course.description.about}
                      </p>
                      <button
                        onClick={() => setReadMoreOpen(true)}
                        className="mt-1 text-xs font-semibold text-violet-600 hover:underline"
                      >
                        Read More
                      </button>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      Course details coming soon.
                    </p>
                  )}

                  <div className="mt-5 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <Clock className="h-4 w-4 text-slate-500" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-700">
                          1 Year Validity
                        </p>
                        <p className="text-[11px] text-slate-400">
                          You will get this course for 1 Full Year(s)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("content");
                        setFolderOpen(true);
                      }}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:border-violet-300 hover:text-violet-700 transition-colors"
                    >
                      <PlayCircle className="h-4 w-4 text-sky-500" />
                      <span className="text-left">
                        <span className="block font-semibold">
                          {contentList.length} Learning Material
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {pdfCount} Files, {videoCount} Video lectures
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-bold text-slate-900">
                    About Course Creator
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Dr. Sarita Chandan Sakure
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    BE, M.Tech, PhD in Computer Science &nbsp;•&nbsp; 16+ Years
                    Experience &nbsp;•&nbsp; All Star Ranger on Trailhead
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    •&nbsp;16X Certified.
                  </p>
                </div>
              </div>
            )}

            {/* ---- CONTENT TAB ---- */}
            {activeTab === "content" && (
              <div className="flex flex-col gap-4 md:min-w-184.5">
                <div className="mt-5 rounded-xl border border-slate-200">
                  {!folderOpen ? (
                    <button
                      type="button"
                      onClick={() => setFolderOpen(true)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-lg">
                        <Folder className="h-5 w-5 text-amber-600" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-violet-700">
                          Computer Skills &amp; Training
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {videoCount} video(s), {pdfCount} file(s)
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={() => setFolderOpen(false)}
                        className="flex items-center gap-2 p-4 text-xs font-bold text-slate-700 hover:text-violet-700 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" /> Computer Skills &amp;
                        Training
                      </button>
                      <div className="divide-y divide-slate-100 border-t border-slate-100">
                        {contentStatus === "loading" && (
                          <p className="p-4 text-sm text-slate-500">Loading PDFs and videos...</p>
                        )}
                        {contentStatus === "ready" && contentList.length === 0 && (
                          <p className="p-4 text-sm text-slate-500">
                            No videos or PDFs are saved for this course in the database yet.
                          </p>
                        )}
                        {contentList.map((item, i) => (
                          <button
                            key={item.id || i}
                            onClick={() => openContentItem(item)}
                            className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors group"
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.type === "video"
                                ? "bg-sky-100 text-sky-600 group-hover:bg-sky-200"
                                : "bg-red-100 text-red-600 group-hover:bg-red-200"
                                } transition-colors`}
                            >
                              {item.type === "video" ? (
                                <PlayCircle className="h-5 w-5" />
                              ) : (
                                <FileText className="h-5 w-5" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 group-hover:text-violet-700 truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="uppercase font-semibold tracking-wide">
                                  {item.type === "video"
                                    ? "Video Lecture"
                                    : "PDF Document"}
                                </span>
                                {item.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{item.duration}</span>
                                  </>
                                )}
                                {item.fileSize && (
                                  <>
                                    <span>•</span>
                                    <span>{item.fileSize}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {purchased ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                <Check className="h-3.5 w-3.5" /> Unlocked
                              </span>
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-slate-200">
                                <Lock className="h-4 w-4" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 p-5">
                  <h2 className="text-sm font-bold text-slate-900">
                    About Course Creator
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Dr. Sarita Chandan Sakure
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    BE, M.Tech, PhD in Computer Science &nbsp;•&nbsp; 16+ Years
                    Experience &nbsp;•&nbsp; All Star Ranger on Trailhead
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- SIDEBAR CARD ---------------- */}
          <aside className="h-fit rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="overflow-hidden rounded-lg bg-slate-100">
              <img
                src={course.image}
                alt={course.title}
                className="block h-auto w-full object-contain"
              />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900">
              {course.title}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-extrabold" style={{ color: ACCENT }}>
                ₹{course.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{course.originalPrice!.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {purchased ? (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("content");
                    setFolderOpen(true);
                  }}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                >
                  <Check className="h-4 w-4" /> Purchased Start Learning
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem(`purchased_${course.slug}`);
                    }
                    setPurchased(false);
                    setTxnId("");
                    setPurchaseStep(null);
                  }}
                  className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Lock className="h-3 w-3" /> Re-lock Course (Test Flow)
                </button>
              </div>
            ) : (
              <button
                onClick={openBuyFlow}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: ACCENT }}
              >
                <ShoppingBag className="h-4 w-4" /> Get this course
              </button>
            )}
          </aside>
        </div>

        {/* ================= READ MORE MODAL ================= */}
        {readMoreOpen && course.description && (
          <ModalShell onClose={() => setReadMoreOpen(false)}>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h3
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {course.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-violet-500">
                Salesforce
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {course.description.about}
              </p>

              {course.description.sections.map((section, i) => (
                <div key={i} className="mt-5">
                  <p className="text-sm font-bold text-slate-800">
                    {section.heading}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {section.points.map((point, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ModalShell>
        )}

        {/* ================= UNLOCKED CONTENT VIEWER MODAL (VIDEO / PDF) ================= */}
        {viewerItem && (
          <ModalShell onClose={() => setViewerItem(null)} customWidth="max-w-4xl">
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      viewerItem.type === "video" ? "bg-sky-100 text-sky-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {viewerItem.type === "video" ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{viewerItem.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold uppercase text-violet-600">
                        {viewerItem.type === "video" ? "Video Lecture" : "PDF Resource"}
                      </span>
                      {viewerItem.duration && <span>• {viewerItem.duration}</span>}
                      {viewerItem.fileSize && <span>• {viewerItem.fileSize}</span>}
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                        <Check className="h-3 w-3" /> Unlocked Content
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* MEDIA VIEWER BODY */}
              {viewerItem.type === "video" ? (
                <div className="space-y-4">
                  {getYouTubeEmbedUrl(viewerItem.url) ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                      <iframe
                        src={getYouTubeEmbedUrl(viewerItem.url)!}
                        title={viewerItem.name}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : viewerItem.url.endsWith(".mp4") || viewerItem.url.endsWith(".webm") ? (
                    <video
                      src={viewerItem.url}
                      controls
                      autoPlay
                      className="w-full rounded-2xl max-h-[60vh] bg-black shadow-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <PlayCircle className="h-12 w-12 text-[#5B4FE0] mb-3" />
                      <p className="text-sm font-bold text-slate-900">{viewerItem.name}</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        This video stream is stored in database. Click below to open and watch full video content.
                      </p>
                      <a
                        href={viewerItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5B4FE0] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#4a3ec8] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" /> Watch Video
                      </a>
                    </div>
                  )}
                  {viewerItem.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {viewerItem.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-[55vh] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <iframe
                      src={viewerItem.url}
                      title={viewerItem.name}
                      className="h-full w-full border-0"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{viewerItem.name}</p>
                      <p className="text-[11px] text-slate-500">PDF Document {viewerItem.fileSize ? `(${viewerItem.fileSize})` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={viewerItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Full Screen
                      </a>
                      <a
                        href={viewerItem.url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalShell>
        )}

        {/* ================= BUY NOW PROMPT MODAL ================= */}
        {purchaseStep === "locked" && (
          <ModalShell onClose={closeAllModals} small>
            <div className="flex flex-col items-center px-8 py-10 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <Lock className="h-7 w-7 text-red-500" />
              </span>
              <p className="mt-4 text-sm font-bold text-slate-900">
                Buy now to start learning!
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Get access to course contents and learn from the comfort of any of
                your devices.
              </p>
              <button
                onClick={() => setPurchaseStep("details")}
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                <ShoppingBag className="h-4 w-4" /> Buy Course Now
              </button>
            </div>
          </ModalShell>
        )}

        {/* ================= CUSTOMER DETAILS MODAL ================= */}
        {purchaseStep === "details" && (
          <ModalShell onClose={closeAllModals} small>
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-900">
                Please fill your details
              </h3>

              <div className="mt-4 space-y-4">
                <Field
                  label="Full Name"
                  required
                  error={touched.fullName ? errors.fullName : ""}
                >
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    onBlur={() => markTouched("fullName")}
                    placeholder="e.g. Harsh"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                </Field>

                <Field
                  label="Mobile Number"
                  required
                  error={touched.mobile ? errors.mobile : ""}
                >
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-violet-400">
                    <span className="text-xs font-semibold text-slate-500">
                      IN
                    </span>
                    <input
                      value={form.mobile}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      onBlur={() => markTouched("mobile")}
                      placeholder="e.g. 81XXXXXXXX"
                      inputMode="numeric"
                      className="w-full text-sm outline-none"
                    />
                  </div>
                </Field>

                <Field
                  label="Email"
                  required
                  error={touched.email ? errors.email : ""}
                >
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    onBlur={() => markTouched("email")}
                    placeholder="name@gmail.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                </Field>

                <Field
                  label="State"
                  required
                  error={touched.state ? errors.state : ""}
                >
                  <select
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                    onBlur={() => markTouched("state")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400"
                  >
                    <option value="">Select a state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* BUTTON: "Get Payment" proceeds directly to Payment Gateway (No OTP!) */}
              <button
                disabled={!isFormValid}
                onClick={handleProceedToPayment}
                className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: ACCENT }}
              >
                <CreditCard className="h-4 w-4" /> Continue to Razorpay
              </button>
            </div>
          </ModalShell>
        )}

        {/* ================= RAZORPAY CHECKOUT ================= */}
        {purchaseStep === "payment" && (
          <ModalShell onClose={closeAllModals} customWidth="max-w-lg">
            <div className="p-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Pay with Razorpay
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  UPI, cards, net banking, and wallets open inside Razorpay. Card details stay with Razorpay.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold text-slate-800">{course.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {form.fullName} · {form.mobile}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Lock className="h-3 w-3 text-slate-400" />
                    Amount
                  </span>
                  <span className="text-base font-extrabold" style={{ color: ACCENT }}>
                    ₹{course.price.toLocaleString("en-IN")}
                  </span>
                </div>

                {paymentError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {paymentError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={isProcessingPayment || course.price < 1}
                  onClick={startRazorpayCheckout}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Waiting for Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay ₹{course.price.toLocaleString("en-IN")} with Razorpay</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  The course unlocks only after our server verifies the Razorpay signature and saves the payment.
                </p>
              </div>
            </div>
          </ModalShell>
        )}

        {/* ================= COURSE UNLOCKED POPUP (1 SECOND AUTO-CLOSE) ================= */}
        {purchaseStep === "unlocked" && (
          <ModalShell onClose={closeAllModals} small>
            <div className="flex flex-col items-center px-6 py-8 text-center animate-in fade-in zoom-in duration-200">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-pulse" />
              </span>
              <h3
                className="mt-4 text-base font-bold text-slate-900"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Course Unlocked Successfully! 🎉
              </h3>
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                ₹{course.price.toLocaleString("en-IN")} Verified &amp; Confirmed
              </p>
              {paymentNotice && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{paymentNotice}</p>
              )}
              {txnId && (
                <p className="mt-2 font-mono text-[11px] text-slate-500">{txnId}</p>
              )}
              <div className="mt-3 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
                <RefreshCw className="h-3 w-3 animate-spin text-violet-600" />
                <span>Loading course materials...</span>
              </div>
            </div>
          </ModalShell>
        )}

        {/* ================= CONTENT VIEWER (VIDEO / PDF) ================= */}
        {viewerItem && (
          <ModalShell
            onClose={() => setViewerItem(null)}
            customWidth="max-w-4xl"
          >
            <div className="flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6">
                <div className="flex items-center gap-3 pr-10 min-w-0">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${viewerItem.type === "video"
                      ? "bg-sky-100 text-sky-600"
                      : "bg-red-100 text-red-600"
                      }`}
                  >
                    {viewerItem.type === "video" ? (
                      <PlayCircle className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                        {viewerItem.type === "video"
                          ? "Now Playing Video"
                          : "Viewing Document"}
                      </span>
                      {viewerItem.duration && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {viewerItem.duration}
                        </span>
                      )}
                      {viewerItem.fileSize && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {viewerItem.fileSize}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {viewerItem.name}
                    </h3>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="hidden sm:flex items-center gap-2 mr-6">
                  {viewerItem.type === "video" ? (
                    <a
                      href={viewerItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-violet-700 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Watch on YouTube</span>
                    </a>
                  ) : (
                    <>
                      <a
                        href={viewerItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-violet-700 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open in Tab</span>
                      </a>
                      <a
                        href={viewerItem.url}
                        download
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Body with Scroll */}
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
                {viewerItem.type === "video" ? (
                  <div>
                    {/* YouTube / Video Container */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
                      {getYouTubeEmbedUrl(viewerItem.url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(viewerItem.url)!}
                          title={viewerItem.name}
                          className="absolute inset-0 h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={viewerItem.url}
                          controls
                          autoPlay
                          className="absolute inset-0 h-full w-full"
                        />
                      )}
                    </div>

                    {/* Video Details Card */}
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {viewerItem.name}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {viewerItem.description ||
                              "Official video lecture for this course module."}
                          </p>
                        </div>
                        <a
                          href={viewerItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sm:hidden inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Watch on YouTube</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* PDF Viewer Container */}
                    <div className="h-[55vh] sm:h-[62vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
                      <iframe
                        src={`${viewerItem.url}#toolbar=1`}
                        title={viewerItem.name}
                        className="h-full w-full border-0"
                      />
                    </div>

                    {/* PDF Details Card */}
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {viewerItem.name}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {viewerItem.description ||
                              "Official course document and study notes."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={viewerItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Open in Tab</span>
                          </a>
                          <a
                            href={viewerItem.url}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Playlist / Quick Switcher */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Course Learning Materials ({contentList.length})
                    </p>
                    <span className="text-[11px] font-medium text-slate-400">
                      Click any item to switch
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {contentList.map((item, idx) => {
                      const isSelected = item.name === viewerItem.name;
                      return (
                        <button
                          key={item.id || idx}
                          onClick={() => setViewerItem(item)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left text-xs transition-all ${isSelected
                            ? "bg-violet-50 border border-violet-300 text-violet-900 font-semibold shadow-xs"
                            : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                            }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.type === "video"
                              ? isSelected
                                ? "bg-violet-600 text-white"
                                : "bg-sky-100 text-sky-600"
                              : isSelected
                                ? "bg-violet-600 text-white"
                                : "bg-red-100 text-red-600"
                              }`}
                          >
                            {item.type === "video" ? (
                              <PlayCircle className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.type === "video"
                                ? `Video • ${item.duration || "Lecture"}`
                                : `PDF • ${item.fileSize || "Document"}`}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide shrink-0">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </ModalShell>
        )}
      </section>
    </AuthGuard>
  );
}

/* ---------------- helper components ---------------- */

function Link_Back() {
  return (
    <Link
      href="/courses"
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-700"
    >
      <ArrowLeft className="h-4 w-4" /> <span>Back to courses</span>
    </Link>
  );
}

function ModalShell({
  children,
  onClose,
  small = false,
  customWidth,
}: {
  children: React.ReactNode;
  onClose: () => void;
  small?: boolean;
  customWidth?: string;
}) {
  const widthClass = customWidth
    ? customWidth
    : small
      ? "max-w-sm"
      : "max-w-lg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${widthClass} my-auto rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden`}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
