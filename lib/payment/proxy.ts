/**
 * ============================================================================
 * 6. PROXY CLASS: RETRY PROXY PATTERN (PaymentGatewayRetryProxy)
 * ============================================================================
 * Implements the Proxy Design Pattern to add automatic retry capability,
 * exponential backoff, and error resilience around any IPaymentGateway.
 */

import { IPaymentGateway } from "./gateways";
import { GatewayType, PaymentRequest, PaymentResponse } from "./types";

export interface RetryProxyOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
}

/**
 * Proxy class wrapping any IPaymentGateway instance to provide transparent
 * retry logic without modifying the underlying gateway's code.
 */
export class PaymentGatewayRetryProxy implements IPaymentGateway {
  private realGateway: IPaymentGateway;
  private maxRetries: number;
  private initialDelayMs: number;
  private backoffFactor: number;

  constructor(
    realGateway: IPaymentGateway,
    options: RetryProxyOptions = {}
  ) {
    this.realGateway = realGateway;
    this.maxRetries = options.maxRetries ?? 3;
    this.initialDelayMs = options.initialDelayMs ?? 400;
    this.backoffFactor = options.backoffFactor ?? 1.5;
  }

  public getGatewayName(): string {
    return `${this.realGateway.getGatewayName()} (Protected with Retry Proxy)`;
  }

  public getGatewayType(): GatewayType {
    return this.realGateway.getGatewayType();
  }

  /**
   * Proxied processPayment with automatic retry execution
   */
  public async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    let lastError: any = null;
    let currentDelay = this.initialDelayMs;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(
          `[RetryProxy] Attempt ${attempt}/${this.maxRetries} forwarding request to ${this.realGateway.getGatewayName()}...`
        );

        // Forward call to underlying real gateway
        const response = await this.realGateway.processPayment(request);

        if (attempt > 1) {
          console.log(
            `[RetryProxy] Successfully recovered on attempt ${attempt}/${this.maxRetries}`
          );
        }

        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[RetryProxy] Attempt ${attempt}/${this.maxRetries} failed with error: "${err?.message || err}"`
        );

        if (attempt < this.maxRetries) {
          console.log(
            `[RetryProxy] Waiting ${currentDelay}ms before retry attempt ${attempt + 1}...`
          );
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay = Math.round(currentDelay * this.backoffFactor);
        }
      }
    }

    console.error(
      `[RetryProxy] All ${this.maxRetries} retry attempts exhausted on ${this.realGateway.getGatewayName()}.`
    );
    throw new Error(
      `Payment processing failed after ${this.maxRetries} attempts: ${lastError?.message || "Unknown error"}`
    );
  }

  /**
   * Proxied verifyPayment call
   */
  public async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      return await this.realGateway.verifyPayment(transactionId);
    } catch (err) {
      console.error(
        `[RetryProxy] Error verifying transaction ${transactionId}:`,
        err
      );
      return false;
    }
  }
}
