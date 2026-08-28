"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Minus,
  RefreshCw,
  Send,
  Sparkles,
  User,
  X,
  Phone,
  GraduationCap,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import { getAIAnswer } from "@/lib/ai/knowledgeBase";

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#7B6EF6";
const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  suggestions?: string[];
  links?: Array<{ label: string; href: string }>;
  isThankYouCard?: boolean;
  leadDetails?: {
    name: string;
    phone: string;
  };
}

export default function CeptraAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Lead Collection State: 'none' | 'ask_name' | 'ask_phone' | 'completed'
  const [leadStep, setLeadStep] = useState<"none" | "ask_name" | "ask_phone" | "completed">("none");
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text:
        "Hello! 👋 Welcome to **Ceptra Infotech** — your premier hub for Salesforce, Cloud & AI Career Excellence!\n\n" +
        "I am your **Ceptra AI Advisor**. How can I help you today? Ask me anything about our live & recorded courses, placement assistance, fees, or book a free demo session!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestions: [
        "What Salesforce courses do you offer?",
        "Tell me about your placement assistance",
        "Who is Dr. Sarita Sakure?",
        "Book a Free Demo Class",
      ],
      links: [
        { label: "View All Courses", href: "/courses" },
        { label: "Book Free Demo", href: "/contact-us" },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  function handleOpenChat() {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnread(false);
  }

  function handleResetChat() {
    setLeadStep("none");
    setLeadName("");
    setLeadPhone("");
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "bot",
        text:
          "Chat reset! 😊 How else can I assist you with **Ceptra Infotech** courses, placements, or admission queries?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: [
          "What Salesforce courses do you offer?",
          "Tell me about your placement assistance",
          "Book a Free Demo Class",
        ],
        links: [{ label: "Browse Courses", href: "/courses" }],
      },
    ]);
  }

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isTyping) return;

    setInputMessage("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // ================= FLOW 1: LEAD CAPTURE - NAME RECEIVED =================
    if (leadStep === "ask_name") {
      const extractedName = textToSend.replace(/(my name is|i am|this is)/gi, "").trim();
      setLeadName(extractedName || textToSend);
      setLeadStep("ask_phone");

      setTimeout(() => {
        setIsTyping(false);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `Nice to meet you, **${extractedName || textToSend}**! 😊\n\n**And the best contact number to reach you on?** (WhatsApp or mobile number for free syllabus and demo access)`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 700);
      return;
    }

    // ================= FLOW 2: LEAD CAPTURE - PHONE RECEIVED -> ATTRACTIVE THANK YOU =================
    if (leadStep === "ask_phone") {
      const extractedPhone = textToSend.replace(/\D/g, "").slice(-10);
      const finalPhone = extractedPhone || textToSend;
      setLeadPhone(finalPhone);
      setLeadStep("completed");

      setTimeout(() => {
        setIsTyping(false);
        const thankYouMsg: ChatMessage = {
          id: `thankyou-${Date.now()}`,
          sender: "bot",
          text: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isThankYouCard: true,
          leadDetails: {
            name: leadName || "Aspiring Tech Leader",
            phone: finalPhone,
          },
          suggestions: [
            "Explore All Courses",
            "Tell me about placement assistance",
            "Ask another question",
          ],
        };
        setMessages((prev) => [...prev, thankYouMsg]);
      }, 800);
      return;
    }

    // ================= FLOW 3: TRIGGER LEAD CAPTURE ON DEMO / COUNSELING =================
    const lower = textToSend.toLowerCase();
    if (
      lower.includes("book") ||
      lower.includes("demo") ||
      lower.includes("counseling") ||
      lower.includes("admission") ||
      lower.includes("call me") ||
      lower.includes("contact me") ||
      lower.includes("enroll")
    ) {
      setLeadStep("ask_name");
      setTimeout(() => {
        setIsTyping(false);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text:
            `We'd love to set up your **Free Demo Class** & personal career counseling session! 🚀\n\n` +
            `To get started, **what is your name?**`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 700);
      return;
    }

    // ================= FLOW 4: STANDARD AI KNOWLEDGE BASE QUERY =================
    setTimeout(() => {
      setIsTyping(false);
      const aiResult = getAIAnswer(textToSend);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: aiResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: aiResult.suggestions,
        links: aiResult.links,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  }

  function startLeadCapture() {
    setLeadStep("ask_name");
    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text:
        `Great! Let's arrange a **Free Demo Class & Career Consultation** for you with our senior mentor team. 🎓\n\n` +
        `To get started, **what is your name?**`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, botMsg]);
  }

  // Parse markdown bold (**text**) and links into clean JSX
  function renderFormattedText(text: string) {
    if (!text) return null;

    return text.split("\n").map((line, idx) => {
      // Process bold markers (**text**)
      const parts = line.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  }

  return (
    <>
      {/* ================= FLOATING LAUNCHER BUTTON ================= */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Tooltip Badge */}
          <div
            onClick={handleOpenChat}
            className="hidden sm:flex cursor-pointer items-center gap-2 rounded-full border border-violet-200/80 bg-white/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md transition-all hover:scale-105"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Ask Ceptra AI
            </span>
            <Sparkles className="h-3.5 w-3.5 text-violet-600 animate-pulse" />
          </div>

          {/* Glowing Trigger Circle */}
          <button
            type="button"
            onClick={handleOpenChat}
            aria-label="Open Ceptra AI Chatbot"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_25px_-5px_rgba(91,79,224,0.6)] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_SOFT} 100%)`,
            }}
          >
            <div className="absolute -inset-1 rounded-full bg-violet-400 opacity-30 blur-sm group-hover:opacity-60 transition-opacity animate-pulse" />
            <Bot className="relative h-7 w-7 text-white" />
            {hasUnread && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[9px] font-bold text-white">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* ================= CHATBOT WINDOW ================= */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[590px] max-h-[88vh]"
          }`}
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white shadow-sm shrink-0"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_SOFT} 100%)`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 border border-white/30 backdrop-blur-xs">
                <Bot className="h-5 w-5 text-white" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-violet-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">
                  Ceptra AI Advisor
                </h3>
                <p className="text-[10.5px] text-white/80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online • Instant Course &amp; Career Help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body / Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2 max-w-[88%] ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          msg.sender === "user"
                            ? "bg-slate-800 text-white"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="space-y-2">
                        {msg.isThankYouCard && msg.leadDetails ? (
                          /* ================= ATTRACTIVE THANK YOU CARD ================= */
                          <div className="rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-white to-amber-50/40 p-4 shadow-md text-slate-800 space-y-3 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                              </span>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                  Thank you, {msg.leadDetails.name}! 🎉
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                  Ceptra Infotech • Demo Request Received
                                </span>
                              </div>
                            </div>

                            <p className="text-xs leading-relaxed text-slate-700">
                              Welcome to <strong className="text-violet-900 font-bold">Ceptra Infotech</strong>! Our senior counselor and faculty will connect with you on{" "}
                              <strong className="font-bold text-slate-900 font-mono">
                                +91 {msg.leadDetails.phone}
                              </strong>{" "}
                              shortly with your free demo class access, course syllabus, and personalized career roadmap.
                            </p>

                            <div className="rounded-xl border border-violet-200/80 bg-violet-50/70 p-2.5 text-[11px] text-violet-900 font-medium">
                              ✨ <strong>Ceptra Infotech Promise:</strong> 100% Practical Training, 1-Year Full Access, and Dedicated Placement Support with 50+ Hiring Partners!
                            </div>

                            <div className="flex flex-col gap-2 pt-1">
                              <a
                                href={`https://wa.me/918862082481?text=${encodeURIComponent(
                                  `Hi Ceptra Infotech, My name is ${msg.leadDetails.name}. I would like to attend the Free Demo Class.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>Instant Connect on WhatsApp</span>
                              </a>

                              <Link
                                href="/courses"
                                onClick={() => setIsOpen(false)}
                                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-white text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
                              >
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>Explore Salesforce Courses</span>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          /* Regular Bot / User Bubble */
                          <div
                            className={`rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                              msg.sender === "user"
                                ? "rounded-tr-none bg-slate-900 text-white"
                                : "rounded-tl-none border border-slate-200/80 bg-white text-slate-800"
                            }`}
                          >
                            {renderFormattedText(msg.text)}
                          </div>
                        )}

                        {/* Interactive Links if available */}
                        {msg.links && msg.links.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.links.map((link, lIdx) => (
                              <Link
                                key={lIdx}
                                href={link.href}
                                onClick={() => {
                                  if (link.href.startsWith("/")) {
                                    setIsOpen(false);
                                  }
                                }}
                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-200 px-2.5 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition-colors"
                              >
                                <span>{link.label}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <span className="mt-1 text-[10px] text-slate-400 px-9">
                      {msg.timestamp}
                    </span>

                    {/* Quick Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5 max-w-[90%]">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              if (sug.toLowerCase().includes("demo") || sug.toLowerCase().includes("counseling")) {
                                startLeadCapture();
                              } else {
                                handleSendMessage(sug);
                              }
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-xs hover:border-violet-400 hover:bg-violet-50/60 hover:text-violet-800 transition-all text-left cursor-pointer"
                          >
                            💬 {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Animation */}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-xs">
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Footer Banner */}
              {leadStep === "none" && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-violet-50/60 px-3.5 py-2 text-[11px]">
                  <span className="text-violet-900 font-medium">
                    Want personalized career advice?
                  </span>
                  <button
                    type="button"
                    onClick={startLeadCapture}
                    className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 font-bold text-white shadow-xs hover:bg-violet-700 transition-colors"
                  >
                    <span>Book Free Demo</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    leadStep === "ask_name"
                      ? "Type your full name..."
                      : leadStep === "ask_phone"
                        ? "Enter your 10-digit mobile number..."
                        : "Ask about courses, fees, placements..."
                  }
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
