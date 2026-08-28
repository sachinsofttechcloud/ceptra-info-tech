/**
 * ============================================================================
 * 2. BANKING SYSTEM INTERFACE & IMPLEMENTATIONS
 * ============================================================================
 * Defines the low-level banking system interface and concrete implementations
 * for Paytm Payments Bank and Razorpay Banking Network.
 */

import { BankTransferResult, ReceiverDetails, SenderDetails } from "./types";

/**
 * Interface representing any underlying banking system/network
 */
export interface IBankingSystem {
  /**
   * Executes inter-bank transfer between sender and merchant receiver
   */
  executeTransfer(
    sender: SenderDetails,
    receiver: ReceiverDetails,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<BankTransferResult>;

  /**
   * Verifies the final settlement status using the bank reference number
   */
  verifySettlement(bankRefNumber: string): Promise<boolean>;

  /**
   * Returns the identification name of this banking system
   */
  getBankName(): string;
}

/**
 * Paytm Banking System Implementation
 * Simulates communication with Paytm Payments Bank & partner NPCI UPI nodes
 */
export class PaytmBankingSystem implements IBankingSystem {
  private bankName = "Paytm Payments Bank & Partner UPI Network";

  public getBankName(): string {
    return this.bankName;
  }

  public async executeTransfer(
    sender: SenderDetails,
    receiver: ReceiverDetails,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<BankTransferResult> {
    console.log(
      `[PaytmBankingSystem] Executing inter-bank transfer of ${currency} ${amount} from ${sender.fullName} to ${receiver.merchantName}...`
    );

    // Simulate network latency (200-400ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate Paytm Bank Reference & Auth code
    const timestamp = Date.now();
    const bankRefNumber = `PTM_REF_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = `AUTH_PTM_${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      bankRefNumber,
      authCode,
      settlementStatus: "SETTLED",
      statusCode: "TXN_SUCCESS",
      message: "Paytm banking transaction authorized and settled successfully",
      timestamp,
    };
  }

  public async verifySettlement(bankRefNumber: string): Promise<boolean> {
    console.log(
      `[PaytmBankingSystem] Verifying settlement for bank reference: ${bankRefNumber}`
    );
    return bankRefNumber.startsWith("PTM_REF_");
  }
}

/**
 * Razorpay Banking System Implementation
 * Simulates communication with Razorpay partner banks (ICICI/HDFC/Axis) & UPI Rails
 */
export class RazorpayBankingSystem implements IBankingSystem {
  private bankName = "Razorpay Direct Banking Switch (ICICI/HDFC/Axis/UPI)";

  public getBankName(): string {
    return this.bankName;
  }

  public async executeTransfer(
    sender: SenderDetails,
    receiver: ReceiverDetails,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<BankTransferResult> {
    console.log(
      `[RazorpayBankingSystem] Routing transfer of ${currency} ${amount} through Razorpay Banking Switch for ${sender.fullName}...`
    );

    // Simulate network latency (200-400ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate Razorpay Bank Reference & Auth code
    const timestamp = Date.now();
    const bankRefNumber = `RZP_REF_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = `AUTH_RZP_${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      bankRefNumber,
      authCode,
      settlementStatus: "SETTLED",
      statusCode: "RZP_200_OK",
      message: "Razorpay banking switch cleared and authorized transfer",
      timestamp,
    };
  }

  public async verifySettlement(bankRefNumber: string): Promise<boolean> {
    console.log(
      `[RazorpayBankingSystem] Verifying settlement for bank reference: ${bankRefNumber}`
    );
    return bankRefNumber.startsWith("RZP_REF_");
  }
}
