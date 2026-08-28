"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
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
  Phone,
  PlayCircle,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type {
  CourseContentItem,
  CourseListItem,
} from "@/app/courses/component/CourseData/coursesList";
import { DEFAULT_COURSE_CONTENT } from "@/app/courses/component/CourseData/coursesList";
import {
  PaymentController,
  PaymentResponse,
  GatewayType,
  DuplicateTransactionError,
  InvalidTransactionError,
  TamperedTransactionError,
} from "@/lib/payment";
import Link from "next/link";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const ACCENT = "#5B4FE0";

// ---- Merchant / UPI config used to build the dynamic QR payment link ----
const MERCHANT_UPI_ID = "7276782674@okbizaxis";
const MERCHANT_NAME = "Ceptra Infotech";

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

const POPULAR_BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India (SBI)",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
];

type PurchaseStep = null | "locked" | "details" | "payment" | "unlocked" | "success";

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

// Builds a UPI deep-link payment string for the exact course price so that
// any UPI app auto-fills the amount the moment it scans the QR code — the
// buyer never has to type it in.
function buildUpiPaymentUri(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: MERCHANT_UPI_ID,
    pn: MERCHANT_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

// 👇 ADD THE NEW FUNCTION HERE
function sendPaymentDetailsToWhatsApp(params: {
  txnId: string;
  payerUpi: string;
  methodLabel?: string;
  amount: number;
  customer: { fullName: string; mobile: string; email: string; state: string };
  courseTitle: string;
}) {
  const { txnId, payerUpi, methodLabel, amount, customer, courseTitle } = params;

  const message =
    `New Payment Confirmation ✅\n\n` +
    `Course: ${courseTitle}\n` +
    `Amount: ₹${amount.toLocaleString("en-IN")}\n` +
    `Payment Method: ${methodLabel || "N/A"}\n` +
    `Transaction ID: ${txnId}\n` +
    `Payer UPI/Account: ${payerUpi}\n\n` +
    `Customer Details:\n` +
    `Name: ${customer.fullName}\n` +
    `Mobile: ${customer.mobile}\n` +
    `Email: ${customer.email || "N/A"}\n` +
    `State: ${customer.state}`;

  window.open(
    `https://wa.me/917276782674?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}
// 👆 END OF NEW FUNCTION

function formatCardNumber(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export default function CourseDetailClient({
  course,
}: {
  course: CourseListItem;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "content">(
    "overview",
  );
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>(null);

  // Payment Gateway selection & method
  const [paymentGateway, setPaymentGateway] = useState<GatewayType>("paytm");
  const [paymentMethod, setPaymentMethod] = useState<
    "upi" | "card" | "netbanking" | "wallet" | "qr"
  >("qr");
  const [bankSubTab, setBankSubTab] = useState<"bank" | "qr">("qr");

  // Payment Confirmation State (Controls visibility of "I've Paid — Unlock Course" button)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [userTxnRef, setUserTxnRef] = useState("");
  const [userUpiId, setUserUpiId] = useState("");

  // Card payment form state
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  // NetBanking state
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const [confirmedDetails, setConfirmedDetails] = useState<{
    txnId: string;
    payerUpi: string;
    merchantUpi: string;
    amount: number;
    paymentMethodDesc?: string;
  } | null>(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentResponse | null>(
    null,
  );

  // Duplicate / Invalid / Tampered Transaction ID Fraud Detection State
  const [duplicateTxnError, setDuplicateTxnError] = useState<{
    txnId: string;
    message: string;
    record?: any;
  } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const [invalidTxnError, setInvalidTxnError] = useState<{
    txnId: string;
    message: string;
  } | null>(null);
  const [showInvalidModal, setShowInvalidModal] = useState(false);

  const [tamperedTxnError, setTamperedTxnError] = useState<{
    txnId: string;
    message: string;
  } | null>(null);
  const [showTamperedModal, setShowTamperedModal] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    state: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [purchased, setPurchased] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [viewerItem, setViewerItem] = useState<CourseContentItem | null>(null);

  const contentList: CourseContentItem[] =
    course.content && course.content.length > 0
      ? course.content
      : DEFAULT_COURSE_CONTENT;

  const videoCount = contentList.filter((i) => i.type === "video").length;
  const pdfCount = contentList.filter((i) => i.type === "pdf").length;

  // The exact-amount UPI payment link that gets encoded into the QR codes
  // below. Recomputed only when the price or course changes.
  const upiPaymentUri = useMemo(
    () => buildUpiPaymentUri(course.price, `Payment for ${course.title}`),
    [course.price, course.title],
  );

  // restore purchase status for this course on load (per-browser demo persistence)
  useEffect(() => {
    const saved = PaymentController.getInstance().checkPurchaseStatus(
      course.slug,
    );
    if (saved) {
      setPurchased(true);
      setTxnId(saved);
    }
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
    mobile: !/^[6-9]\d{9}$/.test(form.mobile)
      ? "Enter a valid 10-digit mobile number"
      : "",
    email:
      form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ? "Enter a valid email"
        : "",
    state: !form.state ? "Select your state" : "",
  };
  const isFormValid =
    !errors.fullName && !errors.mobile && !errors.email && !errors.state;

  const markTouched = (field: string) =>
    setTouched((t) => ({ ...t, [field]: true }));

  // ---- Mandatory Fields Validation for Confirmation across Methods (At least 12 Digits/Characters) ----
  const isTxnRefValid = userTxnRef.trim().length >= 12;

  const isPaytmQrFormValid =
    isTxnRefValid && userUpiId.trim().length >= 3;

  const isPaytmUpiFormValid =
    isTxnRefValid && userUpiId.trim().length >= 3;

  const isPaytmWalletFormValid =
    isTxnRefValid &&
    (userUpiId.trim().length >= 10 || form.mobile.trim().length >= 10);

  const isRazorpayCardFormValid =
    cardForm.cardNumber.replace(/\s/g, "").length === 16 &&
    cardForm.cardHolder.trim().length >= 2 &&
    cardForm.expiry.length === 5 &&
    cardForm.cvv.length >= 3 &&
    isTxnRefValid;

  const isRazorpayUpiFormValid =
    isTxnRefValid && userUpiId.trim().length >= 3;

  const isRazorpayNetBankingFormValid =
    isTxnRefValid && !!selectedBank;

  const isBankQrFormValid =
    isTxnRefValid && userUpiId.trim().length >= 3;

  const isBankNeftFormValid =
    isTxnRefValid && userUpiId.trim().length >= 2;

  function resetConfirmationState() {
    setPaymentConfirmed(false);
    setIsCheckingPayment(false);
    setUserTxnRef("");
    setUserUpiId(form.mobile ? `${form.mobile}@paytm` : "");
    setCardForm({
      cardNumber: "",
      cardHolder: form.fullName || "",
      expiry: "",
      cvv: "",
    });
    setConfirmedDetails(null);
    setDuplicateTxnError(null);
    setShowDuplicateModal(false);
    setInvalidTxnError(null);
    setShowInvalidModal(false);
    setTamperedTxnError(null);
    setShowTamperedModal(false);
  }

  function closeAllModals() {
    setPurchaseStep(null);
    setPaymentError(null);
    setDuplicateTxnError(null);
    setShowDuplicateModal(false);
    setInvalidTxnError(null);
    setShowInvalidModal(false);
    setTamperedTxnError(null);
    setShowTamperedModal(false);
    resetConfirmationState();
  }

  function openBuyFlow() {
    if (purchased) {
      setActiveTab("content");
      setFolderOpen(true);
      return;
    }
    setPurchaseStep("locked");
  }

  /**
   * 11. MAIN CLIENT ACTION: Proceeds from Customer Form directly to Gateway Payment (No OTP!)
   */
  function handleProceedToPayment() {
    setTouched({
      fullName: true,
      mobile: true,
      email: true,
      state: true,
    });
    const validation =
      PaymentController.getInstance().validateCustomerForm(form);
    if (validation.isValid) {
      setPaymentError(null);
      setDuplicateTxnError(null);
      setInvalidTxnError(null);
      setTamperedTxnError(null);
      resetConfirmationState();
      setPurchaseStep("payment");
    }
  }

  /**
   * Payment Confirmation Function: Verifies that payment was completed with
   * mandatory Transaction ID / UTR and UPI ID / Card details through PaymentController,
   * then displays the confirmation message and makes the "I've Paid — Unlock Course" button visible!
   * Checks uniqueness: Duplicate/shared transaction IDs will trigger the Duplicate Modal!
   * Anti-Fraud: Tampered/modified copies of previous IDs trigger the Tampered Fraud Modal!
   */
  async function handleConfirmPaymentStatus(methodLabel?: string) {
    try {
      setIsCheckingPayment(true);
      setPaymentError(null);
      setDuplicateTxnError(null);
      setInvalidTxnError(null);
      setTamperedTxnError(null);

      const payerIdentifier =
        paymentMethod === "card"
          ? `Card •••• ${cardForm.cardNumber.replace(/\s/g, "").slice(-4)} (${cardForm.cardHolder})`
          : paymentMethod === "netbanking"
            ? `${selectedBank} (A/C: ${userUpiId || form.fullName})`
            : userUpiId || (form.mobile ? `${form.mobile}@upi` : "");

      const res = await PaymentController.getInstance().confirmPaymentStatus({
        txnRef: userTxnRef,
        payerUpi: payerIdentifier,
        courseSlug: course.slug,
        courseTitle: course.title,
        customer: form,
      });

      if (res.confirmed) {
        setPaymentConfirmed(true);
        setConfirmedDetails({
          txnId: res.transactionId,
          payerUpi: res.payerUpi,
          merchantUpi: MERCHANT_UPI_ID,
          amount: course.price,
          paymentMethodDesc: methodLabel || paymentMethod.toUpperCase(),
        });
        sendPaymentDetailsToWhatsApp({
          txnId: res.transactionId,
          payerUpi: res.payerUpi,
          methodLabel: methodLabel || paymentMethod.toUpperCase(),
          amount: course.price,
          customer: form,
          courseTitle: course.title,
        });
      }
    } catch (err: any) {
      const isDuplicate =
        err?.alreadyUsed ||
        err instanceof DuplicateTransactionError ||
        (err?.message &&
          (err.message.includes("ALREADY USED") ||
            err.message.includes("already been used") ||
            err.message.includes("already used") ||
            err.message.includes("Duplicate") ||
            err.message.includes("already claimed")));

      const isTampered =
        err?.isTampered ||
        err instanceof TamperedTransactionError ||
        (err?.message &&
          (err.message.includes("Fraud") ||
            err.message.includes("Security Alert") ||
            err.message.includes("modified copy") ||
            err.message.includes("Tampering") ||
            err.message.includes("shares") ||
            err.message.includes("TAMPERED_FRAUD")));

      const isInvalid =
        err?.isInvalid ||
        err instanceof InvalidTransactionError ||
        (err?.message &&
          (err.message.includes("not valid") ||
            err.message.includes("Invalid") ||
            err.message.includes("dummy") ||
            err.message.includes("repeated") ||
            err.message.includes("at least 12")));

      if (isDuplicate) {
        setDuplicateTxnError({
          txnId: userTxnRef.trim(),
          message:
            err?.message ||
            `This Transaction ID (${userTxnRef.trim()}) has already been used and claimed! Please pay first to get your unique Transaction ID.`,
          record: err?.record,
        });
        setShowDuplicateModal(true);
      } else if (isTampered) {
        setTamperedTxnError({
          txnId: userTxnRef.trim(),
          message:
            err?.message ||
            `Fraud Security Alert: The Transaction ID "${userTxnRef.trim()}" is an edited or modified copy of an already used transaction. Modifying digits of someone else's receipt is prohibited.`,
        });
        setShowTamperedModal(true);
      } else if (isInvalid) {
        setInvalidTxnError({
          txnId: userTxnRef.trim(),
          message:
            err?.message ||
            `The Transaction ID "${userTxnRef.trim()}" is not valid. Please check your payment app receipt and enter the genuine 12+ digit Reference / UTR.`,
        });
        setShowInvalidModal(true);
      }

      setPaymentError(
        err?.message ||
        "Could not verify payment transaction. Please check details and retry.",
      );
    } finally {
      setIsCheckingPayment(false);
    }
  }

  /**
   * Main payment execution routed through PaymentController.
   * Registers transaction ID in the server ledger upon successful unlock.
   * Shows a 1-second "Course Unlocked" popup, then automatically switches to the
   * unlocked course slug page with materials open.
   */
  async function executeGatewayPayment(gatewayToUse: GatewayType) {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const controller = PaymentController.getInstance();
      const response = await controller.handleCheckout({
        course: {
          slug: course.slug,
          title: course.title,
          price: course.price,
          image: course.image,
          category: course.category,
        },
        customer: form,
        gatewayType: gatewayToUse,
        paymentMethod,
      });

      // Override with user confirmed transaction ID if provided
      const finalTxnId = confirmedDetails?.txnId || response.transactionId;
      response.transactionId = finalTxnId;

      // 1. Set verified receipt details & persist purchase status
      setPaymentReceipt(response);
      setTxnId(finalTxnId);
      setPurchased(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`purchased_${course.slug}`, finalTxnId);
      }

      // 2. Register claimed transaction in global unique ledger
      controller.registerClaimedTransaction({
        transactionId: finalTxnId,
        courseSlug: course.slug,
        courseTitle: course.title,
        studentName: form.fullName,
        studentMobile: form.mobile,
        studentEmail: form.email,
        amount: course.price,
        gatewayType: gatewayToUse,
        paymentMethod: confirmedDetails?.paymentMethodDesc || paymentMethod,
        payerUpiOrAccount: confirmedDetails?.payerUpi,
        claimedAt: Date.now(),
      });

      // 3. Show 1-second "Course Unlocked" popup
      setPurchaseStep("unlocked");

      // 4. After 1 second, remove popup and show unlocked course slug page with materials open
      setTimeout(() => {
        setPurchaseStep(null);
        setActiveTab("content");
        setFolderOpen(true);
      }, 1000);
    } catch (err: any) {
      console.error("Payment failed:", err);
      setPaymentError(
        err?.message ||
        "Failed to process payment with gateway. Please try again.",
      );
    } finally {
      setIsProcessingPayment(false);
    }
  }

  function completeManualBankPayment() {
    const newTxnId =
      confirmedDetails?.txnId || `CI${Date.now().toString().slice(-8)}`;
    setTxnId(newTxnId);

    const receiptData: PaymentResponse = {
      success: true,
      status: "SUCCESS",
      transactionId: newTxnId,
      orderId: `ORD_MANUAL_${Date.now()}`,
      gatewayType: "bank_transfer",
      amount: course.price,
      currency: "INR",
      timestamp: Date.now(),
      message: "Direct Bank / UPI Transfer completed",
      receiptNumber: `RCP-BNK-${Date.now().toString().slice(-6)}`,
      sender: form,
      courseInfo: {
        slug: course.slug,
        title: course.title,
      },
    };

    setPaymentReceipt(receiptData);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`purchased_${course.slug}`, newTxnId);
    }
    setPurchased(true);

    // Register claimed transaction in global unique ledger
    PaymentController.getInstance().registerClaimedTransaction({
      transactionId: newTxnId,
      courseSlug: course.slug,
      courseTitle: course.title,
      studentName: form.fullName,
      studentMobile: form.mobile,
      studentEmail: form.email,
      amount: course.price,
      gatewayType: "bank_transfer",
      paymentMethod: bankSubTab === "qr" ? "Bank UPI QR" : "Bank NEFT Transfer",
      payerUpiOrAccount: confirmedDetails?.payerUpi,
      claimedAt: Date.now(),
    });

    // Show 1-second "Course Unlocked" popup
    setPurchaseStep("unlocked");

    // After 1 second, remove popup and show unlocked course slug page
    setTimeout(() => {
      setPurchaseStep(null);
      setActiveTab("content");
      setFolderOpen(true);
    }, 1000);
  }

  function openContentItem(item: CourseContentItem) {
    if (purchased) {
      setViewerItem(item);
    } else {
      setPurchaseStep("locked");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link_Back />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---------------- MAIN COLUMN ---------------- */}
        <div>
          <h1
            className="text-lg font-bold text-slate-900 sm:text-xl"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {course.title}
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
            <div className="mt-5 space-y-5">
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
            <div className="flex flex-col gap-4">
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
                <Check className="h-4 w-4" /> Purchased — Start Learning
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
                  resetConfirmationState();
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

              <Field label="Email" error={touched.email ? errors.email : ""}>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  onBlur={() => markTouched("email")}
                  placeholder="Enter your Email"
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
              <CreditCard className="h-4 w-4" /> Get Payment
            </button>
          </div>
        </ModalShell>
      )}

      {/* ================= PAYMENT GATEWAY & QR CODE MODAL ================= */}
      {purchaseStep === "payment" && (
        <ModalShell onClose={closeAllModals} customWidth="max-w-lg">
          <div className="p-6">
            {/* Header with Amount */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Select Payment Option
                </h3>
                <p className="text-xs text-slate-500">
                  Scan QR, Pay via Paytm, or Pay via Razorpay Cards/UPI
                </p>
              </div>
              <div className="text-right">
                <span className="flex items-center justify-end gap-1 text-[11px] text-slate-400 font-medium">
                  <Lock className="h-3 w-3" /> Course Fee
                </span>
                <p
                  className="text-lg font-extrabold"
                  style={{ color: ACCENT }}
                >
                  ₹{course.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Error Message Banner */}
            {paymentError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {paymentError}
              </div>
            )}

            {/* Gateway Selection Tabs */}
            <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setPaymentGateway("paytm");
                  setPaymentMethod("qr");
                  resetConfirmationState();
                  setPaymentError(null);
                }}
                className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-2 text-xs font-bold transition-all ${paymentGateway === "paytm"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <div className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-sky-500" />
                  <span>Paytm</span>
                </div>
                <span className="text-[10px] font-medium text-sky-600 mt-0.5">
                  QR &amp; UPI
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentGateway("razorpay");
                  setPaymentMethod("card");
                  resetConfirmationState();
                  setPaymentError(null);
                }}
                className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-2 text-xs font-bold transition-all ${paymentGateway === "razorpay"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Razorpay</span>
                </div>
                <span className="text-[10px] font-medium text-blue-600 mt-0.5">
                  Cards &amp; UPI
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentGateway("bank_transfer");
                  setBankSubTab("qr");
                  resetConfirmationState();
                  setPaymentError(null);
                }}
                className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-2 text-xs font-bold transition-all ${paymentGateway === "bank_transfer"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <div className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-violet-600" />
                  <span>Direct Bank</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                  NEFT / UPI
                </span>
              </button>
            </div>

            {/* ================= TAB 1: PAYTM ================= */}
            {paymentGateway === "paytm" && (
              <div className="mt-4 space-y-3">
                {/* Method selector inside Paytm */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "qr", label: "Scan Paytm QR", icon: QrCode },
                    { id: "upi", label: "Paytm UPI", icon: Smartphone },
                    { id: "wallet", label: "Paytm Wallet", icon: Wallet },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.id as any);
                        resetConfirmationState();
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === m.id
                        ? "border-sky-500 bg-sky-50 text-sky-800 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <m.icon className="h-3.5 w-3.5" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Subview 1: PAYTM QR CODE */}
                {paymentMethod === "qr" && (
                  <div className="flex flex-col items-center rounded-xl border border-sky-200 bg-sky-50/40 p-4">
                    <ReadOnlyAmount
                      label="Amount to Pay"
                      amount={course.price}
                      accentColor="#0369a1"
                    />

                    <div className="relative mt-3 rounded-xl bg-white p-3 shadow-sm border border-slate-200">
                      <QRCodeSVG value={upiPaymentUri} size={176} level="M" />
                      <span className="absolute bottom-1 right-1 rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
                        PAYTM / UPI
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold text-slate-800">
                      UPI ID: {MERCHANT_UPI_ID}
                    </p>
                    <p className="text-[11px] text-slate-500 text-center mt-0.5">
                      Scan with GPay, PhonePe, Paytm, or any UPI app to transfer ₹{course.price.toLocaleString("en-IN")}.
                    </p>

                    {!paymentConfirmed ? (
                      <div className="mt-4 w-full space-y-2.5 rounded-xl border border-sky-100 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            Confirm Your Payment
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-sky-600 font-semibold">
                            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                            Mandatory Verification
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Transaction ID / UPI Ref (UTR) <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. 428900112233 (12+ digits/chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-sky-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Your UPI ID / Mobile <span className="text-red-500">*</span>:
                          </label>
                          <input
                            value={userUpiId}
                            onChange={(e) => setUserUpiId(e.target.value)}
                            placeholder={`e.g. ${form.mobile || "98XXXXXXXX"}@paytm`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                          />
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isPaytmQrFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Paytm QR UPI")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isPaytmQrFormValid && !isCheckingPayment
                              ? "bg-sky-600 hover:bg-sky-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying Transaction with Bank...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor="#00BAF2"
                        onUnlock={() => executeGatewayPayment("paytm")}
                      />
                    )}
                  </div>
                )}

                {/* Subview 2: PAYTM UPI */}
                {paymentMethod === "upi" && (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <ReadOnlyAmount
                      label="Payable Amount"
                      amount={course.price}
                      accentColor="#0369a1"
                    />

                    {!paymentConfirmed ? (
                      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            Paytm UPI Details
                          </span>
                          <span className="text-[10px] text-sky-600 font-semibold">
                            UPI Verification
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Paytm UPI ID / VPA <span className="text-red-500">*</span>:
                          </label>
                          <input
                            value={userUpiId}
                            onChange={(e) => setUserUpiId(e.target.value)}
                            placeholder={`e.g. ${form.mobile || "98XXXXXXXX"}@paytm`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              UPI App Transaction ID (UTR) <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. 428900112233 (12+ digits/chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-sky-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isPaytmUpiFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Paytm UPI")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isPaytmUpiFormValid && !isCheckingPayment
                              ? "bg-sky-600 hover:bg-sky-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying Paytm UPI...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor="#00BAF2"
                        onUnlock={() => executeGatewayPayment("paytm")}
                      />
                    )}
                  </div>
                )}

                {/* Subview 3: PAYTM WALLET */}
                {paymentMethod === "wallet" && (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <ReadOnlyAmount
                      label="Payable Amount"
                      amount={course.price}
                      accentColor="#0369a1"
                    />

                    {!paymentConfirmed ? (
                      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            Paytm Wallet Account
                          </span>
                          <span className="text-[10px] text-sky-600 font-semibold">
                            Wallet Verification
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Paytm Registered Mobile <span className="text-red-500">*</span>:
                          </label>
                          <input
                            value={userUpiId}
                            onChange={(e) => setUserUpiId(e.target.value)}
                            placeholder={`e.g. ${form.mobile || "98XXXXXXXX"}`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 font-mono"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Wallet Transaction / Order Ref <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. WALLET9841208920 (12+ chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-sky-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isPaytmWalletFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Paytm Wallet")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isPaytmWalletFormValid && !isCheckingPayment
                              ? "bg-sky-600 hover:bg-sky-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying Paytm Wallet...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor="#00BAF2"
                        onUnlock={() => executeGatewayPayment("paytm")}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: RAZORPAY (CARDS, UPI, NETBANKING) ================= */}
            {paymentGateway === "razorpay" && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "card", label: "Cards", icon: CreditCard },
                    { id: "upi", label: "UPI Apps", icon: Smartphone },
                    { id: "netbanking", label: "NetBanking", icon: Building2 },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.id as any);
                        resetConfirmationState();
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === m.id
                        ? "border-blue-600 bg-blue-50 text-blue-800 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <m.icon className="h-3.5 w-3.5" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Subview 2.1: RAZORPAY CARDS */}
                {paymentMethod === "card" && (
                  <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Credit / Debit Card Payment
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                        Visa / MasterCard / RuPay
                      </span>
                    </div>

                    <ReadOnlyAmount
                      label="Amount to Pay"
                      amount={course.price}
                      accentColor="#1e3a8a"
                    />

                    {!paymentConfirmed ? (
                      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              value={cardForm.cardNumber}
                              onChange={(e) =>
                                setCardForm((c) => ({
                                  ...c,
                                  cardNumber: formatCardNumber(e.target.value),
                                }))
                              }
                              maxLength={19}
                              placeholder="4532 •••• •••• 8901"
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 font-mono"
                            />
                            <CreditCard className="absolute right-2.5 top-2 h-4 w-4 text-slate-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Cardholder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={cardForm.cardHolder}
                            onChange={(e) =>
                              setCardForm((c) => ({
                                ...c,
                                cardHolder: e.target.value,
                              }))
                            }
                            placeholder="e.g. HARSH VARDHAN"
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 uppercase"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              value={cardForm.expiry}
                              onChange={(e) =>
                                setCardForm((c) => ({
                                  ...c,
                                  expiry: formatExpiry(e.target.value),
                                }))
                              }
                              maxLength={5}
                              placeholder="MM/YY"
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              CVV <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              value={cardForm.cvv}
                              onChange={(e) =>
                                setCardForm((c) => ({
                                  ...c,
                                  cvv: e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4),
                                }))
                              }
                              maxLength={4}
                              placeholder="•••"
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Razorpay / Bank Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. RZP4920199120 (12+ chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-blue-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isRazorpayCardFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Razorpay Card")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isRazorpayCardFormValid && !isCheckingPayment
                              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Authorizing Card with Razorpay...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor="#0C2340"
                        onUnlock={() => executeGatewayPayment("razorpay")}
                      />
                    )}
                  </div>
                )}

                {/* Subview 2.2: RAZORPAY UPI */}
                {paymentMethod === "upi" && (
                  <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                    <ReadOnlyAmount
                      label="Amount to Pay"
                      amount={course.price}
                      accentColor="#1e3a8a"
                    />

                    {!paymentConfirmed ? (
                      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            Razorpay UPI Details
                          </span>
                          <span className="text-[10px] text-blue-600 font-semibold">
                            UPI Verification
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Your UPI ID / VPA <span className="text-red-500">*</span>:
                          </label>
                          <input
                            value={userUpiId}
                            onChange={(e) => setUserUpiId(e.target.value)}
                            placeholder={`e.g. ${form.mobile || "98XXXXXXXX"}@okhdfcbank`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              UPI Ref Number (UTR) <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. 428900112233 (12+ digits/chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-blue-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isRazorpayUpiFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Razorpay UPI")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isRazorpayUpiFormValid && !isCheckingPayment
                              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying Razorpay UPI...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor="#0C2340"
                        onUnlock={() => executeGatewayPayment("razorpay")}
                      />
                    )}
                  </div>
                )}

                {/* Subview 2.3: RAZORPAY NETBANKING */}
                {paymentMethod === "netbanking" && (
                  <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                    <ReadOnlyAmount
                      label="Amount to Pay"
                      amount={course.price}
                      accentColor="#1e3a8a"
                    />

                    {!paymentConfirmed ? (
                      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Select Your Bank <span className="text-red-500">*</span>:
                          </label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400"
                          >
                            {POPULAR_BANKS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Bank Reference / Transaction ID <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. NETBKICIC892019 (12+ chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-blue-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isRazorpayNetBankingFormValid || isCheckingPayment}
                            onClick={() =>
                              handleConfirmPaymentStatus(`NetBanking (${selectedBank})`)
                            }
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isRazorpayNetBankingFormValid && !isCheckingPayment
                              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying NetBanking Payment...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor="#0C2340"
                        onUnlock={() => executeGatewayPayment("razorpay")}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: DIRECT BANK / QR ================= */}
            {paymentGateway === "bank_transfer" && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
                  {(["qr", "bank"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setBankSubTab(tab);
                        resetConfirmationState();
                      }}
                      className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${bankSubTab === tab
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500"
                        }`}
                    >
                      {tab === "qr" ? "UPI QR Code" : "Bank Transfer Details"}
                    </button>
                  ))}
                </div>

                {bankSubTab === "qr" ? (
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <ReadOnlyAmount
                      label="Course Amount"
                      amount={course.price}
                      accentColor="#5B4FE0"
                    />

                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2">
                      <QRCodeSVG value={upiPaymentUri} size={176} level="M" />
                    </div>
                    <p className="mt-2 text-xs text-slate-700 font-bold">
                      UPI ID: {MERCHANT_UPI_ID}
                    </p>
                    <p className="text-[11px] text-slate-500 text-center mt-0.5">
                      Scan via GPay / PhonePe / Paytm — the ₹
                      {course.price.toLocaleString("en-IN")} amount is
                      pre-filled automatically.
                    </p>

                    {!paymentConfirmed ? (
                      <div className="mt-4 w-full space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            Confirm UPI Payment
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-violet-600 font-semibold">
                            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                            Mandatory Verification
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              UPI Ref Number (UTR) <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. 428900112233 (12+ digits/chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-violet-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Your UPI ID <span className="text-red-500">*</span>:
                          </label>
                          <input
                            value={userUpiId}
                            onChange={(e) => setUserUpiId(e.target.value)}
                            placeholder={`e.g. ${form.mobile || "98XXXXXXXX"}@okaxis`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-violet-400"
                          />
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isBankQrFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Bank UPI QR")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isBankQrFormValid && !isCheckingPayment
                              ? "bg-violet-600 hover:bg-violet-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying Transfer with Bank...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Payment with Transaction ID</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor={ACCENT}
                        onUnlock={completeManualBankPayment}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs">
                      <Row label="Account Name" value="Ceptra Infotech Pvt Ltd" />
                      <Row label="Bank" value="ICICI Bank" />
                      <Row label="Account No." value="196505000970" />
                      <Row label="IFSC Code" value="ICIC0001965" />
                      <Row
                        label="Amount"
                        value={`₹${course.price.toLocaleString("en-IN")}`}
                      />
                    </div>

                    {!paymentConfirmed ? (
                      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              NEFT / IMPS Reference Number <span className="text-red-500">*</span>:
                            </label>
                            <span
                              className={`text-[10px] font-mono font-bold ${userTxnRef.trim().length >= 12
                                ? "text-emerald-600"
                                : "text-slate-400"
                                }`}
                            >
                              {userTxnRef.trim().length >= 12
                                ? `${userTxnRef.trim().length} digits ✓`
                                : `${userTxnRef.trim().length}/12+ digits`}
                            </span>
                          </div>
                          <input
                            value={userTxnRef}
                            maxLength={35}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\s+/g, "").slice(0, 35);
                              setUserTxnRef(val);
                              if (duplicateTxnError) setDuplicateTxnError(null);
                              if (invalidTxnError) setInvalidTxnError(null);
                              if (tamperedTxnError) setTamperedTxnError(null);
                              if (paymentError) setPaymentError(null);
                            }}
                            placeholder="e.g. ICIC4928109920 (12+ chars)"
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 outline-none font-mono transition-colors ${(duplicateTxnError &&
                              duplicateTxnError.txnId.toUpperCase() ===
                              userTxnRef.trim().toUpperCase()) ||
                              (invalidTxnError &&
                                invalidTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase()) ||
                              (tamperedTxnError &&
                                tamperedTxnError.txnId.toUpperCase() ===
                                userTxnRef.trim().toUpperCase())
                              ? "border-red-500 bg-red-50/40 focus:border-red-600"
                              : "border-slate-200 focus:border-violet-400"
                              }`}
                          />
                          {duplicateTxnError &&
                            duplicateTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
                                <span>Already used Transaction ID! Please pay first to get your unique ID.</span>
                              </p>
                            )}
                          {tamperedTxnError &&
                            tamperedTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>Tampered / Modified Transaction ID detected! Changing digits is prohibited.</span>
                              </p>
                            )}
                          {invalidTxnError &&
                            invalidTxnError.txnId.toUpperCase() ===
                            userTxnRef.trim().toUpperCase() && (
                              <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                <span>{invalidTxnError.message}</span>
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Sender Account Name / Details <span className="text-red-500">*</span>:
                          </label>
                          <input
                            value={userUpiId}
                            onChange={(e) => setUserUpiId(e.target.value)}
                            placeholder={`e.g. ${form.fullName || "Harsh"} (A/C)`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-violet-400"
                          />
                        </div>

                        {userTxnRef.trim().length >= 12 ? (
                          <button
                            type="button"
                            disabled={!isBankNeftFormValid || isCheckingPayment}
                            onClick={() => handleConfirmPaymentStatus("Bank NEFT Transfer")}
                            className={`mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isBankNeftFormValid && !isCheckingPayment
                              ? "bg-violet-600 hover:bg-violet-700 cursor-pointer opacity-100"
                              : "bg-slate-400 cursor-not-allowed opacity-50"
                              }`}
                          >
                            {isCheckingPayment ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Verifying Bank Settlement...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Confirm Bank Transfer</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-2 px-3 text-center text-[11px] text-slate-500">
                            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Enter at least 12 digits (GPay / Paytm / Bank ref) to confirm</span>
                            <span className="font-mono text-slate-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {userTxnRef.trim().length}/12+
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ConfirmedDetailsCard
                        confirmedDetails={confirmedDetails}
                        isProcessingPayment={isProcessingPayment}
                        buttonColor={ACCENT}
                        onUnlock={completeManualBankPayment}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Upon payment confirmation, course materials unlock immediately.
            </p>
          </div>
        </ModalShell>
      )}

      {/* ================= DUPLICATE / FRAUD TRANSACTION WARNING MODAL ================= */}
      {showDuplicateModal && duplicateTxnError && (
        <ModalShell onClose={() => setShowDuplicateModal(false)} small>
          <div className="flex flex-col items-center px-6 py-6 text-center animate-in fade-in zoom-in duration-200">
            {/* Animated Alert Badge */}
            <div className="relative flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-red-100 animate-ping opacity-75" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-lg">
                <ShieldAlert className="h-7 w-7" />
              </span>
            </div>

            <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-0.5 text-[11px] font-extrabold tracking-wide text-red-700 uppercase">
              <AlertTriangle className="h-3.5 w-3.5" /> Duplicate Transaction ID
            </span>

            <h3
              className="mt-2 text-base font-extrabold text-slate-900 leading-snug"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              This Transaction ID is Already Used!
            </h3>

            <div className="mt-3 w-full rounded-xl border border-red-200 bg-red-50/70 p-3 text-left">
              <div className="flex items-center justify-between border-b border-red-200/60 pb-1.5 text-xs">
                <span className="font-semibold text-slate-600">Entered Reference:</span>
                <span className="font-mono font-extrabold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                  {duplicateTxnError.txnId}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-red-900 leading-relaxed">
                ⚠️ This Transaction ID / UTR has already been claimed and verified for a course purchase. Each payment reference is unique and cannot be reused or shared across accounts.
              </p>
            </div>

            <div className="mt-3 w-full rounded-lg bg-amber-50 p-2.5 text-left border border-amber-200/80 text-[11px] text-amber-900">
              <p className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                💡 How to proceed:
              </p>
              <p>
                Please complete your payment of <strong>₹{course.price.toLocaleString("en-IN")}</strong> via the QR code or payment options, then enter your unique Transaction ID (UTR).
              </p>
            </div>

            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setUserTxnRef("");
                  setPaymentError(null);
                  setDuplicateTxnError(null);
                  setInvalidTxnError(null);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all cursor-pointer"
              >
                <span>Pay Now &amp; Enter New Transaction ID</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = `Hello Ceptra Infotech Team, my Transaction ID (${duplicateTxnError.txnId}) is showing as already used for course: "${course.title}". My mobile is ${form.mobile || "registered"}. Please assist.`;
                  window.open(
                    `https://wa.me/918862082481?text=${encodeURIComponent(msg)}`,
                    "_blank"
                  );
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Contact WhatsApp Support</span>
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ================= INVALID / WRONG TRANSACTION WARNING MODAL ================= */}
      {showInvalidModal && invalidTxnError && (
        <ModalShell onClose={() => setShowInvalidModal(false)} small>
          <div className="flex flex-col items-center px-6 py-6 text-center animate-in fade-in zoom-in duration-200">
            {/* Animated Alert Badge */}
            <div className="relative flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-rose-100 animate-ping opacity-75" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg">
                <AlertTriangle className="h-7 w-7" />
              </span>
            </div>

            <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-0.5 text-[11px] font-extrabold tracking-wide text-rose-700 uppercase">
              <AlertTriangle className="h-3.5 w-3.5" /> Invalid Transaction ID
            </span>

            <h3
              className="mt-2 text-base font-extrabold text-slate-900 leading-snug"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              This Transaction ID is Not Valid!
            </h3>

            <div className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-left">
              <div className="flex items-center justify-between border-b border-rose-200/60 pb-1.5 text-xs">
                <span className="font-semibold text-slate-600">Entered Reference:</span>
                <span className="font-mono font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                  {invalidTxnError.txnId}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-rose-900 leading-relaxed">
                {invalidTxnError.message}
              </p>
            </div>

            <div className="mt-3 w-full rounded-lg bg-amber-50 p-2.5 text-left border border-amber-200/80 text-[11px] text-amber-900">
              <p className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                💡 Where to find your genuine Transaction ID:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600">
                <li><strong>Google Pay / PhonePe:</strong> 12-digit UPI reference ID (UTR)</li>
                <li><strong>Paytm:</strong> Order ID or Transaction reference (12+ digits)</li>
                <li><strong>NetBanking / IMPS:</strong> Bank transaction reference number</li>
              </ul>
            </div>

            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowInvalidModal(false);
                  setUserTxnRef("");
                  setPaymentError(null);
                  setInvalidTxnError(null);
                  setDuplicateTxnError(null);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-rose-600 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-all cursor-pointer"
              >
                <span>Re-enter Correct Transaction ID</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = `Hello Ceptra Infotech Team, my Transaction ID (${invalidTxnError.txnId}) is showing as invalid for course: "${course.title}". My mobile is ${form.mobile || "registered"}. Please assist.`;
                  window.open(
                    `https://wa.me/918862082481?text=${encodeURIComponent(msg)}`,
                    "_blank"
                  );
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Contact WhatsApp Support</span>
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ================= TAMPERED / MODIFIED TRANSACTION FRAUD WARNING MODAL ================= */}
      {showTamperedModal && tamperedTxnError && (
        <ModalShell onClose={() => setShowTamperedModal(false)} small>
          <div className="flex flex-col items-center px-6 py-6 text-center animate-in fade-in zoom-in duration-200">
            {/* Animated Alert Badge */}
            <div className="relative flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-rose-200 animate-ping opacity-75" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-amber-500 text-white shadow-xl ring-4 ring-rose-100">
                <ShieldAlert className="h-7 w-7 animate-bounce" />
              </span>
            </div>

            <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-0.5 text-[11px] font-extrabold tracking-wide text-rose-700 uppercase">
              <ShieldAlert className="h-3.5 w-3.5" /> Anti-Fraud Security Alert
            </span>

            <h3
              className="mt-2 text-base font-extrabold text-slate-900 leading-snug"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Modified / Fake Transaction Reference Detected!
            </h3>

            <div className="mt-3 w-full rounded-xl border border-rose-300 bg-rose-50/80 p-3.5 text-left shadow-xs">
              <div className="flex items-center justify-between border-b border-rose-200/80 pb-1.5 text-xs">
                <span className="font-semibold text-slate-600">Entered Reference:</span>
                <span className="font-mono font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300">
                  {tamperedTxnError.txnId}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-rose-900 leading-relaxed">
                🚫 {tamperedTxnError.message}
              </p>
            </div>

            <div className="mt-3 w-full rounded-lg bg-amber-50 p-2.5 text-left border border-amber-200/80 text-[11px] text-amber-900">
              <p className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                ⚠️ Why this was blocked:
              </p>
              <p className="leading-normal">
                Our banking security system detected that this Transaction ID is an edited copy (digits changed) of an existing payment receipt. Changing digits or reusing receipts is strictly prohibited. Each student must complete a genuine payment.
              </p>
            </div>

            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowTamperedModal(false);
                  setUserTxnRef("");
                  setPaymentError(null);
                  setTamperedTxnError(null);
                  setDuplicateTxnError(null);
                  setInvalidTxnError(null);
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-rose-600 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-all cursor-pointer"
              >
                <span>Pay Genuine Amount &amp; Unlock</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = `Hello Ceptra Infotech Team, my Transaction ID (${tamperedTxnError.txnId}) was flagged as a modified reference for course: "${course.title}". Please verify my payment.`;
                  window.open(
                    `https://wa.me/918862082481?text=${encodeURIComponent(msg)}`,
                    "_blank"
                  );
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Contact WhatsApp Support</span>
              </button>
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
  );
}

/* ---------------- helper components ---------------- */

function ConfirmedDetailsCard({
  confirmedDetails,
  isProcessingPayment,
  buttonColor,
  onUnlock,
}: {
  confirmedDetails: {
    txnId: string;
    payerUpi: string;
    merchantUpi: string;
    amount: number;
    paymentMethodDesc?: string;
  } | null;
  isProcessingPayment: boolean;
  buttonColor: string;
  onUnlock: () => void;
}) {
  if (!confirmedDetails) return null;

  return (
    <div className="mt-4 w-full flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-200">
      <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800 pb-1 border-b border-emerald-200/60">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Payment Confirmed Successfully!</span>
        </div>
        <div className="space-y-1 text-slate-600 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-mono font-bold text-slate-800">
              {confirmedDetails.txnId}
            </span>
          </div>
          {confirmedDetails.paymentMethodDesc && (
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-semibold text-slate-800">
                {confirmedDetails.paymentMethodDesc}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Merchant UPI:</span>
            <span className="font-semibold text-slate-800">
              {confirmedDetails.merchantUpi}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payer Details:</span>
            <span className="font-semibold text-slate-800">
              {confirmedDetails.payerUpi}
            </span>
          </div>
          <div className="flex justify-between border-t border-emerald-200/40 pt-1 mt-1">
            <span className="text-slate-500 font-medium">Amount Paid:</span>
            <span className="font-extrabold text-emerald-700 text-xs">
              ₹{confirmedDetails.amount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* BUTTON VISIBLE ONLY AFTER PAYMENT IS CONFIRMED */}
      <button
        disabled={isProcessingPayment}
        onClick={onUnlock}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        style={{ backgroundColor: buttonColor }}
      >
        {isProcessingPayment ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Unlocking Course...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-white" />
            <span>
              I&apos;ve Paid ₹{confirmedDetails.amount.toLocaleString("en-IN")} — Unlock Course
            </span>
          </>
        )}
      </button>
    </div>
  );
}

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

// A visually "locked" amount display — used everywhere the fee is shown so
// buyers can see it clearly, but can never edit it.
function ReadOnlyAmount({
  label,
  amount,
  accentColor = "#5B4FE0",
}: {
  label: string;
  amount: number;
  accentColor?: string;
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Lock className="h-3 w-3 text-slate-400" />
        {label}
      </span>
      <span
        className="text-base font-extrabold"
        style={{ color: accentColor }}
      >
        ₹{amount.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
