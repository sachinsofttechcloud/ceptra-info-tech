/**
 * ============================================================================
 * 7 & 8. GATEWAY FACTORY (FACTORY PATTERN) & STATIC INSTANCES (REGISTRY)
 * ============================================================================
 * Defines:
 * - PaymentGatewayFactory: Encapsulates creation of gateway instances with dependencies
 * - PaymentGatewayRegistry: Provides centralized static instances (Singleton Registry)
 */

import { PaytmBankingSystem, RazorpayBankingSystem } from "./banking";
import {
  IPaymentGateway,
  PaytmPaymentGateway,
  RazorpayPaymentGateway,
} from "./gateways";
import { PaymentGatewayRetryProxy, RetryProxyOptions } from "./proxy";
import { GatewayType } from "./types";

/**
 * 7. Gateway Factory Pattern
 * Creates properly configured gateway instances wrapped with Retry Proxies.
 */
export class PaymentGatewayFactory {
  /**
   * Factory method to create an IPaymentGateway by GatewayType
   */
  public static createGateway(
    type: GatewayType,
    retryOptions?: RetryProxyOptions
  ): IPaymentGateway {
    switch (type) {
      case "paytm": {
        const bankingSystem = new PaytmBankingSystem();
        const rawGateway = new PaytmPaymentGateway(bankingSystem);
        return new PaymentGatewayRetryProxy(rawGateway, retryOptions);
      }

      case "razorpay": {
        const bankingSystem = new RazorpayBankingSystem();
        const rawGateway = new RazorpayPaymentGateway(bankingSystem);
        return new PaymentGatewayRetryProxy(rawGateway, retryOptions);
      }

      default:
        throw new Error(`[PaymentGatewayFactory] Unsupported gateway type: ${type}`);
    }
  }
}

/**
 * 8. Static Instance Provider & Gateway Registry (Singleton / Registry Pattern)
 * Provides static access to pre-instantiated, resilient payment gateways.
 */
export class PaymentGatewayRegistry {
  private static razorpayInstance: IPaymentGateway | null = null;
  private static paytmInstance: IPaymentGateway | null = null;

  /**
   * Static access to the singleton Razorpay Gateway instance
   */
  public static getRazorpayGateway(): IPaymentGateway {
    if (!this.razorpayInstance) {
      this.razorpayInstance = PaymentGatewayFactory.createGateway("razorpay", {
        maxRetries: 3,
        initialDelayMs: 350,
      });
    }
    return this.razorpayInstance;
  }

  /**
   * Static access to the singleton Paytm Gateway instance
   */
  public static getPaytmGateway(): IPaymentGateway {
    if (!this.paytmInstance) {
      this.paytmInstance = PaymentGatewayFactory.createGateway("paytm", {
        maxRetries: 3,
        initialDelayMs: 350,
      });
    }
    return this.paytmInstance;
  }

  /**
   * Static lookup by GatewayType
   */
  public static getGateway(type: GatewayType): IPaymentGateway {
    if (type === "paytm") {
      return this.getPaytmGateway();
    }
    return this.getRazorpayGateway();
  }
}
