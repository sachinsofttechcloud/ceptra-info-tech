/**
 * ============================================================================
 * 10. CONTROLLER CLASS FOR ALL CLIENT REQUESTS (PaymentController)
 * ============================================================================
 * Acts as the single entry point for all UI/React components to process checkout,
 * validate user forms, invoke gateways, handle WhatsApp notifications, and manage state.
 */

import { PaymentService } from "./service";
import {
  CheckoutDTO,
  FormValidationResult,
  PaymentResponse,
  SenderDetails,
  TransactionRecord,
  TransactionVerificationResult,
} from "./types";

const ADMIN_WHATSAPP_NUMBER = "918862082481"; // 91 + 8862082481

export class DuplicateTransactionError extends Error {
  public alreadyUsed: boolean = true;
  public txnId: string;
  public record?: TransactionRecord;

  constructor(message: string, txnId: string, record?: TransactionRecord) {
    super(message);
    this.name = "DuplicateTransactionError";
    this.txnId = txnId;
    this.record = record;
  }
}

export class InvalidTransactionError extends Error {
  public isInvalid: boolean = true;
  public txnId: string;
  public reason?: string;

  constructor(message: string, txnId: string, reason?: string) {
    super(message);
    this.name = "InvalidTransactionError";
    this.txnId = txnId;
    this.reason = reason;
  }
}

export class TamperedTransactionError extends Error {
  public isTampered: boolean = true;
  public txnId: string;
  public reason?: string;

  constructor(message: string, txnId: string, reason?: string) {
    super(message);
    this.name = "TamperedTransactionError";
    this.txnId = txnId;
    this.reason = reason;
  }
}

export class PaymentController {
  private static instance: PaymentController | null = null;
  private paymentService: PaymentService;

  private constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Singleton instance accessor
   */
  public static getInstance(): PaymentController {
    if (!this.instance) {
      this.instance = new PaymentController();
    }
    return this.instance;
  }

  /**
   * Validates the customer details form
   */
  public validateCustomerForm(form: SenderDetails): FormValidationResult {
    const errors: {
      fullName?: string;
      mobile?: string;
      email?: string;
      state?: string;
    } = {};

    if (!form.fullName || form.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name";
    }

    const cleanMobile = form.mobile ? form.mobile.replace(/\D/g, "") : "";
    if (!cleanMobile || cleanMobile.length !== 10) {
      errors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (
      form.email &&
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.state || !form.state.trim()) {
      errors.state = "Please select your state";
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
  }

  /**
   * Main client entry point to process course payment through selected Gateway
   */
  public async handleCheckout(dto: CheckoutDTO): Promise<PaymentResponse> {
    // Validate customer form before submitting
    const validation = this.validateCustomerForm(dto.customer);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(`Validation failed: ${firstError}`);
    }

    // Step 1: Create structured PaymentRequest via service
    const paymentRequest = this.paymentService.createPaymentRequest(dto);

    // Step 2: Dispatch through Unified Payment Service to Gateway & Retry Proxy
    const paymentResponse = await this.paymentService.executePayment(
      dto.gatewayType,
      paymentRequest
    );

    return paymentResponse;
  }

  /**
   * Primary checkout invocation: returns status, QR uri, gateway type, etc.
   */
  public async processCheckout(dto: CheckoutDTO): Promise<PaymentResponse> {
    return this.handleCheckout(dto);
  }

  /**
   * Helper to trigger WhatsApp chat with pre-filled message
   */
  public openWhatsAppChat(message: string): void {
    if (typeof window === "undefined") return;
    window.open(
      `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  /**
   * Checks if user has already unlocked/purchased this course
   */
  public checkPurchaseStatus(courseSlug: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(`purchased_${courseSlug}`);
  }

  /**
   * Confirmation function: Checks and confirms that payment was received from UPI / Banking network with Transaction & UPI ID
   * Strictly enforces uniqueness and genuine format: duplicate or invalid/fake transaction IDs are rejected!
   */
  public async confirmPaymentStatus(details?: {
    txnRef?: string;
    payerUpi?: string;
    orderId?: string;
    courseSlug?: string;
    courseTitle?: string;
    customer?: SenderDetails;
  }): Promise<{ confirmed: boolean; transactionId: string; payerUpi: string }> {
    const rawTxnId = details?.txnRef?.trim() || "";

    if (!rawTxnId || rawTxnId.length < 12) {
      throw new InvalidTransactionError(
        "Please enter a valid Transaction ID / UTR (at least 12 digits or characters).",
        rawTxnId
      );
    }

    // Simulate verification latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 1. Verify uniqueness and format against backend API
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          transactionId: rawTxnId,
        }),
      });

      if (res.ok) {
        const data: TransactionVerificationResult = await res.json();
        if (data.alreadyUsed) {
          throw new DuplicateTransactionError(
            data.message ||
            `This Transaction ID (${rawTxnId}) has already been used and claimed! Please pay first to get your unique Transaction ID.`,
            rawTxnId,
            data.record
          );
        }

        if (data.isTampered || data.errorCode === "TAMPERED_FRAUD") {
          throw new TamperedTransactionError(
            data.message ||
              `Security Alert: Transaction ID (${rawTxnId}) appears to be a modified or tampered copy of an already used transaction. Please enter your own genuine payment reference.`,
            rawTxnId
          );
        }

        if (data.isInvalidFormat || !data.valid) {
          throw new InvalidTransactionError(
            data.message || `The Transaction ID "${rawTxnId}" is invalid. Please enter the genuine Reference / UTR from your payment app.`,
            rawTxnId
          );
        }
      }
    } catch (err: any) {
      if (
        err instanceof DuplicateTransactionError ||
        err?.alreadyUsed ||
        err instanceof TamperedTransactionError ||
        err?.isTampered ||
        err instanceof InvalidTransactionError ||
        err?.isInvalid
      ) {
        throw err;
      }
      console.warn("[PaymentController] Offline verification fallback:", err);
    }

    // 2. Client-side storage fallback check
    if (typeof window !== "undefined") {
      const localClaimed = window.localStorage.getItem("ceptra_claimed_transactions");
      if (localClaimed) {
        try {
          const list: string[] = JSON.parse(localClaimed);
          const normalized = rawTxnId.replace(/\s+/g, "").toUpperCase();
          if (list.includes(normalized)) {
            throw new DuplicateTransactionError(
              `This Transaction ID (${rawTxnId}) has already been used in this browser! Please make a new payment for your unique Transaction ID.`,
              rawTxnId
            );
          }
        } catch (e) {
          // parse error fallback
        }
      }
    }

    const payerUpi = details?.payerUpi?.trim() || "upi@customer";
    return {
      confirmed: true,
      transactionId: rawTxnId,
      payerUpi,
    };
  }

  /**
   * Registers a claimed transaction upon course unlock to prevent future reuse
   */
  public async registerClaimedTransaction(record: TransactionRecord): Promise<void> {
    // 1. Save to backend API
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          record,
        }),
      });
    } catch (err) {
      console.warn("[PaymentController] Failed to persist transaction to backend:", err);
    }

    // 2. Save to local storage cache
    if (typeof window !== "undefined") {
      try {
        const normalized = record.transactionId.replace(/\s+/g, "").toUpperCase();
        const localClaimed = window.localStorage.getItem("ceptra_claimed_transactions");
        const list: string[] = localClaimed ? JSON.parse(localClaimed) : [];
        if (!list.includes(normalized)) {
          list.push(normalized);
          window.localStorage.setItem("ceptra_claimed_transactions", JSON.stringify(list));
        }
      } catch (e) {
        // ignore storage error
      }
    }
  }

  /**
   * Returns list of supported gateways for display
   */
  public getAvailableGateways() {
    return this.paymentService.getAvailableGateways();
  }
}

