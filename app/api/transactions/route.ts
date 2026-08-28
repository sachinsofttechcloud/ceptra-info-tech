import { NextRequest, NextResponse } from "next/server";
import {
  verifyTransactionUniqueness,
  registerTransaction,
  getAllTransactions,
  resetTransactions,
} from "@/lib/payment/transactionStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action || "verify";

    // 1. Verification Action: Checks if a transaction ID is unique
    if (action === "verify") {
      const transactionId = body?.transactionId;
      if (!transactionId || typeof transactionId !== "string") {
        return NextResponse.json(
          {
            valid: false,
            alreadyUsed: false,
            message: "Transaction ID is required for verification.",
          },
          { status: 400 }
        );
      }

      const result = verifyTransactionUniqueness(transactionId);
      return NextResponse.json(result, { status: 200 });
    }

    // 2. Registration Action: Locks and claims a unique transaction ID upon course unlock
    if (action === "register") {
      const record = body?.record;
      if (!record || !record.transactionId) {
        return NextResponse.json(
          {
            success: false,
            message: "Transaction record details are required.",
          },
          { status: 400 }
        );
      }

      try {
        const registration = registerTransaction(record);
        return NextResponse.json(registration, { status: 200 });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            alreadyUsed: true,
            message: err?.message || "This transaction ID has already been registered.",
          },
          { status: 409 }
        );
      }
    }

    // 3. Reset Action (For developer testing / test flow)
    if (action === "reset") {
      resetTransactions();
      return NextResponse.json({ success: true, message: "Transaction store reset successfully." });
    }

    return NextResponse.json({ success: false, message: "Unknown action provided." }, { status: 400 });
  } catch (error: any) {
    console.error("[Transaction API Error]:", error);
    return NextResponse.json(
      {
        valid: false,
        alreadyUsed: false,
        message: "Internal server error while processing transaction verification.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txnId = searchParams.get("txnId");

    if (txnId) {
      const result = verifyTransactionUniqueness(txnId);
      return NextResponse.json(result);
    }

    const all = getAllTransactions();
    return NextResponse.json({
      count: all.length,
      transactions: all,
    });
  } catch (error: any) {
    console.error("[Transaction API GET Error]:", error);
    return NextResponse.json({ count: 0, transactions: [] }, { status: 500 });
  }
}
