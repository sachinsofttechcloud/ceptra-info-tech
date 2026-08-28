/**
 * ============================================================================
 * 3, 4 & 5. PAYMENT GATEWAY INTERFACES, TEMPLATE METHOD BASE & CONCRETE GATEWAYS
 * ============================================================================
 * Defines:
 * - IPaymentGateway interface
 * - PaymentGatewayBase: Abstract class implementing Template Method Pattern
 * - PaytmPaymentGateway: Concrete gateway for Paytm
 * - RazorpayPaymentGateway: Concrete gateway for Razorpay
 */

import { IBankingSystem } from "./banking";
import { GatewayType, PaymentRequest, PaymentResponse } from "./types";

/**
 * Standard Payment Gateway Interface
 */
export interface IPaymentGateway {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<boolean>;
  getGatewayName(): string;
  getGatewayType(): GatewayType;
}

/**
 * Abstract Base Class defining the Template Method pattern for payment processing.
 * Standardizes the algorithm execution sequence across all payment gateways.
 */
export abstract class PaymentGatewayBase implements IPaymentGateway {
  protected bankingSystem: IBankingSystem;
  protected gatewayName: string;
  protected gatewayType: GatewayType;

  constructor(
    bankingSystem: IBankingSystem,
    gatewayName: string,
    gatewayType: GatewayType
  ) {
    this.bankingSystem = bankingSystem;
    this.gatewayName = gatewayName;
    this.gatewayType = gatewayType;
  }

  public getGatewayName(): string {
    return this.gatewayName;
  }

  public getGatewayType(): GatewayType {
    return this.gatewayType;
  }

  /**
   * TEMPLATE METHOD: Defines the standard invariant payment workflow algorithm
   */
  public async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    console.log(
      `\n--- [${this.gatewayName}] Starting Standard Payment Workflow ---`
    );

    // Step 1: Validate incoming payment request
    this.validateRequest(request);

    // Step 2: Authenticate Merchant credentials
    await this.authenticateMerchant(request);

    // Step 3: Initiate Gateway Order token
    const orderToken = await this.initiateOrderToken(request);

    // Step 4: Execute Banking / Network transaction (Hook method implemented by subclass)
    const bankResult = await this.executeBankingTransaction(request, orderToken);

    if (!bankResult.success) {
      throw new Error(
        `Banking transaction failed on ${this.gatewayName}: ${bankResult.message}`
      );
    }

    // Step 5: Verify cryptographic signature / auth token
    this.verifyTransactionSignature(request, bankResult);

    // Step 6: Generate standardized receipt and response
    const response = this.buildPaymentResponse(request, bankResult);

    // Step 7: Audit log transaction
    this.logTransaction(request, response);

    console.log(
      `--- [${this.gatewayName}] Payment Processed Successfully: ${response.transactionId} ---\n`
    );
    return response;
  }

  /**
   * Step 1: Standard request validation
   */
  protected validateRequest(request: PaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error(`[${this.gatewayName}] Invalid payment amount: ${request.amount}`);
    }
    if (!request.sender.fullName || request.sender.fullName.trim().length < 2) {
      throw new Error(`[${this.gatewayName}] Invalid sender name.`);
    }
    if (!request.sender.mobile || !/^[6-9]\d{9}$/.test(request.sender.mobile)) {
      throw new Error(`[${this.gatewayName}] Invalid 10-digit mobile number.`);
    }
    if (!request.courseInfo.title) {
      throw new Error(`[${this.gatewayName}] Course information is missing.`);
    }
  }

  /**
   * Step 2: Merchant verification
   */
  protected async authenticateMerchant(request: PaymentRequest): Promise<boolean> {
    // Validates merchant identity
    if (!request.receiver.merchantName) {
      throw new Error(`[${this.gatewayName}] Receiver merchant info missing.`);
    }
    return true;
  }

  /**
   * Step 3: Order Token creation hook
   */
  protected async initiateOrderToken(request: PaymentRequest): Promise<string> {
    return `${this.gatewayType.toUpperCase()}_ORD_${request.orderId}`;
  }

  /**
   * Step 4: ABSTRACT METHOD - Implemented specifically by each concrete gateway
   */
  protected abstract executeBankingTransaction(
    request: PaymentRequest,
    orderToken: string
  ): Promise<any>;

  /**
   * Step 5: Verify signature hook
   */
  protected verifyTransactionSignature(
    request: PaymentRequest,
    bankResult: any
  ): boolean {
    return !!bankResult.authCode;
  }

  /**
   * Step 6: Build standardized PaymentResponse
   */
  protected abstract buildPaymentResponse(
    request: PaymentRequest,
    bankResult: any
  ): PaymentResponse;

  /**
   * Step 7: Standard audit logging
   */
  protected logTransaction(
    request: PaymentRequest,
    response: PaymentResponse
  ): void {
    console.log(
      `[Audit Log] Txn ${response.transactionId} | Amount: ${response.currency} ${response.amount} | Gateway: ${this.gatewayName} | Customer: ${request.sender.fullName} (${request.sender.mobile}) | Course: ${request.courseInfo.title}`
    );
  }

  /**
   * Verification method for existing transactions
   */
  public async verifyPayment(transactionId: string): Promise<boolean> {
    return this.bankingSystem.verifySettlement(transactionId);
  }
}

/**
 * 4. Concrete Payment Gateway for Paytm
 */
export class PaytmPaymentGateway extends PaymentGatewayBase {
  constructor(bankingSystem: IBankingSystem) {
    super(bankingSystem, "Paytm Payment Gateway", "paytm");
  }

  protected async executeBankingTransaction(
    request: PaymentRequest,
    orderToken: string
  ) {
    console.log(
      `[PaytmPaymentGateway] Interfacing with Paytm API for Order ${orderToken}...`
    );
    return await this.bankingSystem.executeTransfer(
      request.sender,
      request.receiver,
      request.amount,
      request.currency,
      { orderToken, channel: request.paymentMethod || "paytm_wallet_upi" }
    );
  }

  protected buildPaymentResponse(
    request: PaymentRequest,
    bankResult: any
  ): PaymentResponse {
    const timestamp = Date.now();
    const transactionId = `PTM_TXN_${timestamp.toString().slice(-8)}_${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `RCP-PTM-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      status: "SUCCESS",
      transactionId,
      orderId: request.orderId,
      gatewayType: "paytm",
      amount: request.amount,
      currency: request.currency,
      timestamp,
      message: "Payment successfully received and verified via Paytm Payment Gateway",
      receiptNumber,
      sender: request.sender,
      courseInfo: request.courseInfo,
      paymentMethod: request.paymentMethod || "Paytm All-In-One UPI / Wallet",
      rawGatewayResponse: {
        bankRefNumber: bankResult.bankRefNumber,
        authCode: bankResult.authCode,
        gateway: "Paytm Gateway v2.4",
      },
    };
  }
}

/**
 * 5. Concrete Payment Gateway for Razorpay
 */
export class RazorpayPaymentGateway extends PaymentGatewayBase {
  constructor(bankingSystem: IBankingSystem) {
    super(bankingSystem, "Razorpay Secure Gateway", "razorpay");
  }

  protected async executeBankingTransaction(
    request: PaymentRequest,
    orderToken: string
  ) {
    console.log(
      `[RazorpayPaymentGateway] Interfacing with Razorpay API for Order ${orderToken}...`
    );
    return await this.bankingSystem.executeTransfer(
      request.sender,
      request.receiver,
      request.amount,
      request.currency,
      { orderToken, method: request.paymentMethod || "razorpay_standard" }
    );
  }

  protected buildPaymentResponse(
    request: PaymentRequest,
    bankResult: any
  ): PaymentResponse {
    const timestamp = Date.now();
    const transactionId = `pay_${timestamp.toString().slice(-8)}${Math.random().toString(36).substring(2, 6)}`;
    const receiptNumber = `RCP-RZP-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      status: "SUCCESS",
      transactionId,
      orderId: request.orderId,
      gatewayType: "razorpay",
      amount: request.amount,
      currency: request.currency,
      timestamp,
      message: "Payment successfully received and verified via Razorpay Secure Gateway",
      receiptNumber,
      sender: request.sender,
      courseInfo: request.courseInfo,
      paymentMethod: request.paymentMethod || "Razorpay UPI / Cards / NetBanking",
      rawGatewayResponse: {
        bankRefNumber: bankResult.bankRefNumber,
        authCode: bankResult.authCode,
        gateway: "Razorpay Standard Checkout v2",
      },
    };
  }
}
