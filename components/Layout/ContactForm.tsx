"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Mail, MapPin, Clock3, Send, CheckCircle2 } from "lucide-react";
import emailjs from "@emailjs/browser";

gsap.registerPlugin(ScrollTrigger);

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const INK_SOFT = "#5B5B68";

interface FormData {
  fullName: string;
  mobile: string;
  email: string;
  message: string;
  consent: boolean;
}

interface FormErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  message?: string;
  consent?: string;
}

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const contactInfoRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobile: "",
    email: "",
    message: "",
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // --------------------------------------------------
  // GSAP ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        formRef.current,
        {
          x: -60,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 82%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        contactInfoRef.current,
        {
          x: 60,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contactInfoRef.current,
            start: "top 82%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        mapRef.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mapRef.current,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // Floating animation for contact cards
      gsap.to(".contact-info-card", {
        y: -4,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateField = (
    name: keyof FormData,
    value: string | boolean,
  ): string => {
    switch (name) {
      case "fullName": {
        const nameValue = String(value).trim();

        if (!nameValue) {
          return "Full name is required.";
        }

        if (nameValue.length < 4) {
          return "Name must be at least 4 characters.";
        }

        if (nameValue.length > 50) {
          return "Name cannot exceed 50 characters.";
        }

        if (!/^[a-zA-Z\s.'-]+$/.test(nameValue)) {
          return "Please enter a valid name.";
        }

        return "";
      }

      case "mobile": {
        const mobileValue = String(value);

        if (!mobileValue) {
          return "Mobile number is required.";
        }

        if (!/^\d+$/.test(mobileValue)) {
          return "Please enter numbers only.";
        }

        if (mobileValue.length < 10) {
          return "Enter correct number.";
        }

        if (mobileValue.length > 10) {
          return "Mobile number cannot exceed 10 digits.";
        }

        return "";
      }

      case "email": {
        const emailValue = String(value).trim();

        if (!emailValue) {
          return "Email is required.";
        }

        if (!emailValue.includes("@") || !emailValue.includes(".")) {
          return "Please enter a valid email address.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          return "Please enter a valid email address.";
        }

        return "";
      }

      case "message": {
        const messageValue = String(value).trim();

        if (!messageValue) {
          return "Message is required.";
        }

        return "";
      }

      case "consent": {
        if (!value) {
          return "Please accept the terms and privacy policy.";
        }

        return "";
      }

      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullNameError = validateField("fullName", formData.fullName);

    const mobileError = validateField("mobile", formData.mobile);

    const emailError = validateField("email", formData.email);

    const messageError = validateField("message", formData.message);

    const consentError = validateField("consent", formData.consent);

    if (fullNameError) newErrors.fullName = fullNameError;
    if (mobileError) newErrors.mobile = mobileError;
    if (emailError) newErrors.email = emailError;
    if (messageError) newErrors.message = messageError;
    if (consentError) newErrors.consent = consentError;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // INPUT HANDLER
  // --------------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === "mobile") {
      // Only numbers
      const onlyNumbers = value.replace(/\D/g, "");

      // Maximum 10 digits
      const limitedNumber = onlyNumbers.slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        mobile: limitedNumber,
      }));

      if (limitedNumber.length > 0) {
        setErrors((prev) => ({
          ...prev,
          mobile: validateField("mobile", limitedNumber),
        }));
      }

      return;
    }

    if (name === "fullName") {
      // Maximum 50 characters
      const limitedName = value.slice(0, 50);

      setFormData((prev) => ({
        ...prev,
        fullName: limitedName,
      }));

      setErrors((prev) => ({
        ...prev,
        fullName: validateField("fullName", limitedName),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof FormData, value),
    }));
  };

  // --------------------------------------------------
  // CHECKBOX
  // --------------------------------------------------

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      consent: checked,
    }));

    setErrors((prev) => ({
      ...prev,
      consent: checked ? "" : "Please accept the terms and privacy policy.",
    }));
  };

  // --------------------------------------------------
  // FORM VALID STATE
  // --------------------------------------------------

  const isFormValid =
    formData.fullName.trim().length >= 4 &&
    formData.fullName.trim().length <= 50 &&
    /^[a-zA-Z\s.'-]+$/.test(formData.fullName.trim()) &&
    formData.mobile.length === 10 &&
    /^[0-9]{10}$/.test(formData.mobile) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
    formData.message.trim().length > 0 &&
    formData.consent;

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const EMAILJS_SERVICE_ID = "service_8yk7hqy";
  const EMAILJS_TEMPLATE_ID = "template_zpgyczh";
  const EMAILJS_AUTOREPLY_TEMPLATE_ID = "template_r0lw4vh";
  const EMAILJS_PUBLIC_KEY = "YqXjjAdQt3XzPV9hl";

  try {
    // 1) Notify the admin
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        message: formData.message,
      },
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );

    // 2) Auto-reply to the person who filled the form
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUTOREPLY_TEMPLATE_ID,
        {
          to_email: formData.email,
          to_name: formData.fullName,
          fullName: formData.fullName,
        },
        {
          publicKey: EMAILJS_PUBLIC_KEY,
        }
      );
    } catch (autoReplyError: unknown) {
      // Pull the real reason out instead of logging a collapsed object —
      // this prints directly as readable text in the console, no need to
      // manually expand anything.
      const err = autoReplyError as { status?: number; text?: string };
      console.warn(
        `Auto-reply failed to send status: ${err?.status ?? "unknown"}, reason: ${
          err?.text ?? "no reason given"
        }`
      );
      // Doesn't block success — admin already got notified either way.
    }

    setSubmitted(true);

    setFormData({
      fullName: "",
      mobile: "",
      email: "",
      message: "",
      consent: false,
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 2000);
  } catch (error: unknown) {
    const err = error as { status?: number; text?: string; message?: string };
    console.error(
      `Email sending failed — status: ${err?.status ?? "unknown"}, reason: ${
        err?.text || err?.message || "no reason given"
      }`
    );
    alert("Failed to send message. Please try again.");
  }
};

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#8A7DFF]/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-[#8A7DFF]/30 blur-3xl" />

      {/* --------------------------------------------------
          HEADING
      -------------------------------------------------- */}

      <div
        ref={headingRef}
        className="relative z-10 mx-auto mb-10 max-w-3xl text-center sm:mb-14"
      >
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.18em] text-[#8A7DFF]">
          Contact Us
        </span>

        <h2
          className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl lg:text-5xl"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          We&apos;re here to help
        </h2>

        <p
          className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base"
          style={{ color: INK_SOFT }}
        >
          Got questions about our services? Reach out — we&apos;re just a
          message away.
        </p>
      </div>

      {/* --------------------------------------------------
          MAIN CONTACT AREA
      -------------------------------------------------- */}

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 rounded-2xl bg-[#8A7DFF]/20 p-4 shadow-sm sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:p-7">
        {/* ==================================================
            LEFT - FORM
        ================================================== */}

        <div
          ref={formRef}
          className="rounded-xl bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.07)] sm:p-7"
        >
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="mb-5">
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={50}
                placeholder="Enter full name"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 ${
                  errors.fullName
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-100"
                }`}
              />

              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Mobile */}
            <div className="mb-5">
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                placeholder="Enter mobile number"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 ${
                  errors.mobile
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-100"
                }`}
              />

              {errors.mobile && (
                <p className="mt-1.5 text-xs text-red-500">{errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email <span className="text-red-500">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 ${
                  errors.email
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-100"
                }`}
              />

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Message */}
            <div className="mb-5">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Message <span className="text-red-500">*</span>
              </label>

              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter message"
                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 ${
                  errors.message
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-100"
                }`}
              />

              {errors.message && (
                <p className="mt-1.5 text-xs text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Checkbox */}
            <div className="mb-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={handleCheckbox}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-cyan-600"
                />

                <span className="text-xs leading-5 text-slate-500">
                  By submitting this form, I acknowledge and agree to the{" "}
                  <a
                    href="#"
                    className="font-semibold text-slate-700 underline hover:text-cyan-600"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-semibold text-slate-700 underline hover:text-cyan-600"
                  >
                    Privacy Policy
                  </a>
                  , and consent to being contacted regarding my enquiry.
                </span>
              </label>

              {errors.consent && (
                <p className="mt-1.5 text-xs text-red-500">{errors.consent}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`group flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold transition-all duration-300 ${
                isFormValid
                  ? "cursor-pointer bg-[linear-gradient(135deg,#5B4FE0,#8A7DFF)] text-white shadow-md shadow-cyan-600/20 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#5B4FE0,#9A8FFF)]/ hover:shadow-lg"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 size={18} />
                  Submitted Successfully
                </>
              ) : (
                <>
                  Get in Touch Now
                  <Send
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ==================================================
            RIGHT - CONTACT DETAILS
        ================================================== */}

        <div
          ref={contactInfoRef}
          className="flex flex-col justify-between px-2 py-3 sm:px-4 lg:py-2"
        >
          <div>
            {/* Phone */}
            <a
              href="tel:8806600044"
              className="contact-info-card group mb-5 flex items-start gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-white/70"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8A7DFF] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#8A7DFF] group-hover:text-white">
                <Phone size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A7DFF]">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700 group-hover:text-[#8A7DFF]">
                  8806600044
                </p>

                <p className="text-sm font-medium text-slate-700 group-hover:text-[#8A7DFF]">
                  7276782674
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:ceptrainfotech@gmail.com"
              className="contact-info-card group mb-5 flex items-start gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-white/70"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8A7DFF] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#8A7DFF] group-hover:text-white">
                <Mail size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A7DFF]">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-700 group-hover:text-[#8A7DFF]">
                  ceptrainfotech@gmail.com
                </p>
              </div>
            </a>

            {/* Location */}
            <div
              className="contact-info-card mb-5 flex items-start gap-4 rounded-xl p-3 cursor-pointer"
              onClick={() =>
                window.open(
                  "https://www.google.com/maps/search/?api=1&query=Ceptra+Infotech+Pvt+Ltd+RH+22+Vyanktesh+Nagar+Nandanvan+Nagpur+Maharashtra+440009",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8A7DFF] shadow-sm">
                <MapPin size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A7DFF]">
                  Visit Us
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Ceptra Infotech Pvt Ltd
                  <br />
                  RH 22 Vyanktesh Nagar
                  <br />
                  Nandanvan, Nagpur
                  <br />
                  Maharashtra 440009
                  <br />
                  MH, IN
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="contact-info-card flex items-start gap-4 rounded-xl p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8A7DFF] shadow-sm">
                <Clock3 size={20} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A7DFF]">
                  Working Hours
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  <span className="font-medium">Mon – Sat:</span> 10:00 am –
                  7:00 pm
                  <br />
                  <span className="font-medium">Sunday:</span> Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          MAP
      -------------------------------------------------- */}

      <div
        ref={mapRef}
        className="relative z-10 mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl bg-[#8A7DFF]/20 p-2 shadow-sm sm:mt-10"
      >
        <div className="overflow-hidden rounded-xl">
          <iframe
            title="Ceptra Infotech Pvt Ltd Location"
            src="https://www.google.com/maps?q=Ceptra%20Infotech%20Pvt%20Ltd%20RH%2022%20Vyanktesh%20Nagar%20Nandanvan%20Nagpur%20Maharashtra%20440009&output=embed"
            className="h-[300px] w-full border-0 sm:h-[380px] lg:h-[450px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}



