/**
 * ============================================================================
 * 1. DATA STRUCTURES FOR PAYMENT DETAILS & REQUESTS
 * ============================================================================
 * Defines all standard data types, request/response models, and status enums
 * used across the entire payment processing lifecycle.
 */

/**
 * Supported payment gateway vendors
 */
export type GatewayType = "razorpay" | "paytm" | "bank_transfer";

/**
 * Payment processing status lifecycle
 */
export type PaymentStatus =
  | "PENDING"
  | "INITIATED"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

/**
 * Sender (Customer / Student) details
 */
export interface SenderDetails {
  fullName: string;
  mobile: string;
  email: string;
  state: string;
  userId?: string;
}

/**
 * Receiver (Merchant / Business) details
 */
export interface ReceiverDetails {
  merchantId: string;
  merchantName: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

/**
 * Course information associated with the payment
 */
export interface CoursePaymentInfo {
  slug: string;
  title: string;
  image?: string;
  category?: string;
}

/**
 * Standard Payment Request object passed to Gateways
 */
export interface PaymentRequest {
  orderId: string;
  sender: SenderDetails;
  receiver: ReceiverDetails;
  amount: number;
  currency: string; // e.g. "INR"
  courseInfo: CoursePaymentInfo;
  paymentMethod?: "upi" | "card" | "netbanking" | "wallet" | "qr";
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Standard Payment Response / Result generated after processing
 */
export interface PaymentResponse {
  success: boolean;
  status: PaymentStatus;
  transactionId: string;
  orderId: string;
  gatewayType: GatewayType;
  amount: number;
  currency: string;
  timestamp: number;
  message: string;
  receiptNumber: string;
  sender: SenderDetails;
  courseInfo: CoursePaymentInfo;
  paymentMethod?: string;
  rawGatewayResponse?: Record<string, any>;
}

/**
 * Result returned from the underlying Banking System
 */
export interface BankTransferResult {
  success: boolean;
  bankRefNumber: string;
  authCode: string;
  settlementStatus: "SETTLED" | "PENDING" | "FAILED";
  statusCode: string;
  message: string;
  timestamp: number;
}

/**
 * Client Checkout DTO submitted from UI components
 */
export interface CheckoutDTO {
  course: CoursePaymentInfo & { price: number };
  customer: SenderDetails;
  gatewayType: GatewayType;
  paymentMethod?: "upi" | "card" | "netbanking" | "wallet" | "qr";
}

/**
 * Form validation result for checkout data
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: {
    fullName?: string;
    mobile?: string;
    email?: string;
    state?: string;
  };
}

/**
 * Record of a claimed / used transaction ID
 */
export interface TransactionRecord {
  transactionId: string;
  courseSlug: string;
  courseTitle: string;
  studentName: string;
  studentMobile: string;
  studentEmail?: string;
  amount: number;
  gatewayType: GatewayType | string;
  paymentMethod?: string;
  payerUpiOrAccount?: string;
  claimedAt: number;
  formattedDate?: string;
}

/**
 * Result of checking a transaction ID uniqueness & validity
 */
export interface TransactionVerificationResult {
  valid: boolean;
  alreadyUsed: boolean;
  isInvalidFormat?: boolean;
  isTampered?: boolean;
  errorCode?:
    | "DUPLICATE"
    | "INVALID_FORMAT"
    | "TOO_SHORT"
    | "TOO_LONG"
    | "TAMPERED_FRAUD"
    | "UNVERIFIED_BANK_RECORD";
  message: string;
  record?: TransactionRecord;
}

