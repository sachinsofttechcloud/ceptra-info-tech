import { NextRequest, NextResponse } from "next/server";
import { getAIAnswer } from "@/lib/ai/knowledgeBase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body?.message || "";
    const leadData = body?.leadData;

    if (leadData && leadData.name && leadData.phone) {
      console.log("[Ceptra AI Chatbot Lead Captured]:", {
        name: leadData.name,
        phone: leadData.phone,
        courseInterest: leadData.courseInterest || "General Inquiry",
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        isLeadResponse: true,
        thankYou: true,
        userName: leadData.name,
        userPhone: leadData.phone,
      });
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          answer:
            "Hello! I am your Ceptra AI Advisor. How can I help you with our courses, placements, or demo bookings?",
          suggestions: ["What courses do you offer?", "Tell me about placements", "Book a Free Demo"],
        },
        { status: 200 }
      );
    }

    const aiResponse = getAIAnswer(message);
    return NextResponse.json(aiResponse);
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    return NextResponse.json(
      {
        answer:
          "I am here to assist you with any questions regarding Ceptra Infotech courses, placements, and demo classes. Feel free to ask!",
        suggestions: ["What courses do you offer?", "Tell me about placements", "Book a Free Demo"],
      },
      { status: 200 }
    );
  }
}
