/**
 * ============================================================================
 * 9. UNIFIED API SERVICE (FACADE PATTERN)
 * ============================================================================
 * Coordinates high-level payment flows, builds structured PaymentRequests,
 * interfaces with the Gateway Registry, and handles local storage persistence.
 */

import { PaymentGatewayRegistry } from "./factory";
import {
  CheckoutDTO,
  GatewayType,
  PaymentRequest,
  PaymentResponse,
  ReceiverDetails,
} from "./types";

/**
 * Standard Merchant Receiver Profile for Ceptra Infotech
 */
export const CEPTRA_MERCHANT_RECEIVER: ReceiverDetails = {
  merchantId: "CEPTRA_MERCHANT_IN",
  merchantName: "Ceptra Infotech Pvt Ltd",
  accountNumber: "196505000970",
  ifscCode: "ICIC0001965",
  upiId: "7276782674@okbizaxis",
};

/**
 * Unified Payment Service (Facade)
 */
export class PaymentService {
  /**
   * Prepares and creates a standardized PaymentRequest from a CheckoutDTO
   */
  public createPaymentRequest(dto: CheckoutDTO): PaymentRequest {
    const timestamp = Date.now();
    const orderId = `ORD_${timestamp.toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

    return {
      orderId,
      sender: {
        fullName: dto.customer.fullName.trim(),
        mobile: dto.customer.mobile.trim(),
        email: dto.customer.email.trim(),
        state: dto.customer.state,
      },
      receiver: CEPTRA_MERCHANT_RECEIVER,
      amount: dto.course.price,
      currency: "INR",
      courseInfo: {
        slug: dto.course.slug,
        title: dto.course.title,
        image: dto.course.image,
        category: dto.course.category,
      },
      paymentMethod: dto.paymentMethod || "upi",
      timestamp,
    };
  }

  /**
   * Main unified execution API: Dispatches to the requested gateway via Registry
   */
  public async executePayment(
    gatewayType: GatewayType,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    console.log(
      `[PaymentService] Executing payment for Course: "${request.courseInfo.title}" using gateway: "${gatewayType}"`
    );

    const gateway = PaymentGatewayRegistry.getGateway(gatewayType);
    const response = await gateway.processPayment(request);

    // Save payment locally for browser persistence
    this.persistPayment(response);

    return response;
  }

  /**
   * Verifies an existing transaction
   */
  public async verifyTransaction(
    gatewayType: GatewayType,
    transactionId: string
  ): Promise<boolean> {
    const gateway = PaymentGatewayRegistry.getGateway(gatewayType);
    return await gateway.verifyPayment(transactionId);
  }

  /**
   * Returns list of supported payment gateway descriptors for UI rendering
   */
  public getAvailableGateways() {
    return [
      {
        id: "razorpay" as GatewayType,
        name: "Razorpay Secure Checkout",
        subtitle: "UPI, Cards (Visa/Mastercard), NetBanking, Cred, GPay, PhonePe",
        badge: "RECOMMENDED",
        accentColor: "#0C2340",
      },
      {
        id: "paytm" as GatewayType,
        name: "Paytm All-In-One Gateway",
        subtitle: "Paytm UPI, Paytm Wallet, QR Code, Postpaid, NetBanking",
        badge: "FASTEST",
        accentColor: "#00BAF2",
      },
    ];
  }

  /**
   * Local demo persistence
   */
  private persistPayment(response: PaymentResponse): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        `purchased_${response.courseInfo.slug}`,
        response.transactionId
      );
      window.localStorage.setItem(
        `receipt_${response.transactionId}`,
        JSON.stringify(response)
      );
    } catch (e) {
      console.warn("[PaymentService] Could not save to localStorage", e);
    }
  }
}
