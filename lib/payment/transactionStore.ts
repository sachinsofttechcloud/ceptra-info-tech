/**
 * ============================================================================
 * TRANSACTION LEDGER & STORE (Server-Side Persistence)
 * ============================================================================
 * Manages the persistent ledger of all verified & claimed transaction IDs.
 * Ensures strict uniqueness across devices, users, and sessions to prevent
 * duplicate/fraudulent reuse of transaction references.
 */

import fs from "fs";
import path from "path";
import { TransactionRecord, TransactionVerificationResult } from "./types";

// In-memory cache for fast lookups
const inMemoryTransactions = new Map<string, TransactionRecord>();
let isInitialized = false;

// Path to persistent JSON file store
const DATA_DIR = path.join(process.cwd(), "data");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");

/**
 * Pre-seeded sample claimed transactions for demonstration and testing.
 * If someone enters any of these, the system will immediately flag it as duplicate/already used.
 */
const INITIAL_SEEDED_TRANSACTIONS: TransactionRecord[] = [
  {
    transactionId: "428900112233",
    courseSlug: "full-stack-web-development",
    courseTitle: "Full Stack Web Development (MERN / Next.js)",
    studentName: "Rahul Sharma",
    studentMobile: "9876543210",
    studentEmail: "rahul.sharma@example.com",
    amount: 14999,
    gatewayType: "paytm",
    paymentMethod: "Paytm QR UPI",
    payerUpiOrAccount: "rahul@paytm",
    claimedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toLocaleString("en-IN"),
  },
  {
    transactionId: "598210398214",
    courseSlug: "data-science-machine-learning",
    courseTitle: "Data Science & AI / ML Masterclass",
    studentName: "Priya Patel",
    studentMobile: "9123456780",
    studentEmail: "priya.p@example.com",
    amount: 19999,
    gatewayType: "razorpay",
    paymentMethod: "Razorpay UPI",
    payerUpiOrAccount: "priya@okhdfcbank",
    claimedAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toLocaleString("en-IN"),
  },
  {
    transactionId: "998877665544",
    courseSlug: "cloud-devops-mastery",
    courseTitle: "Cloud DevOps & Kubernetes Engineer",
    studentName: "Amit Verma",
    studentMobile: "9988776655",
    amount: 16999,
    gatewayType: "bank_transfer",
    paymentMethod: "Bank NEFT Transfer",
    payerUpiOrAccount: "Amit Verma (ICICI A/C)",
    claimedAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    formattedDate: new Date(Date.now() - 1000 * 60 * 60 * 5).toLocaleString("en-IN"),
  },
];

/**
 * Normalizes a transaction ID for uniform comparison (case-insensitive, trimmed)
 */
export function normalizeTxnId(rawId: string): string {
  if (!rawId) return "";
  return rawId.trim().replace(/\s+/g, "").toUpperCase();
}

/**
 * Loads transactions from persistent file into in-memory cache
 */
function initializeStore(): void {
  if (isInitialized) return;

  try {
    // Seed initial records first
    for (const seed of INITIAL_SEEDED_TRANSACTIONS) {
      inMemoryTransactions.set(normalizeTxnId(seed.transactionId), seed);
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Read existing file if present
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const fileData = fs.readFileSync(TRANSACTIONS_FILE, "utf-8");
      const records: TransactionRecord[] = JSON.parse(fileData);
      if (Array.isArray(records)) {
        for (const rec of records) {
          if (rec && rec.transactionId) {
            inMemoryTransactions.set(normalizeTxnId(rec.transactionId), rec);
          }
        }
      }
    } else {
      // Save initial seeded file
      saveToDisk();
    }
  } catch (error) {
    console.warn("[TransactionStore] Warning initializing storage:", error);
  } finally {
    isInitialized = true;
  }
}

/**
 * Persists current in-memory map to JSON file
 */
function saveToDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const allRecords = Array.from(inMemoryTransactions.values());
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(allRecords, null, 2), "utf-8");
  } catch (error) {
    console.warn("[TransactionStore] Warning saving transactions to disk:", error);
  }
}

/**
 * Checks if a transaction ID has already been used/claimed
 */
/**
 * Calculates Levenshtein edit distance between two strings
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Checks whether a transaction ID is an edited, modified, or tampered copy
 * of an existing claimed transaction ID (e.g. user changed 1, 2, or a few digits).
 */
export function checkTamperedTransaction(
  normalizedId: string,
  claimedTransactions: TransactionRecord[]
): { isTampered: boolean; matchedClaimedId?: string; reason?: string } {
  for (const record of claimedTransactions) {
    const claimedNormalized = normalizeTxnId(record.transactionId);
    if (!claimedNormalized || claimedNormalized === normalizedId) continue;

    // 1. Long Common Prefix Check: e.g. 8 or more identical leading digits with edited suffix
    let commonPrefix = 0;
    while (
      commonPrefix < normalizedId.length &&
      commonPrefix < claimedNormalized.length &&
      normalizedId[commonPrefix] === claimedNormalized[commonPrefix]
    ) {
      commonPrefix++;
    }

    if (commonPrefix >= 8 && normalizedId !== claimedNormalized) {
      const masked = `${claimedNormalized.slice(0, 4)}••••${claimedNormalized.slice(-2)}`;
      return {
        isTampered: true,
        matchedClaimedId: claimedNormalized,
        reason: `This ID shares ${commonPrefix} leading characters with a previously claimed transaction reference (${masked}). Tampering with or changing digits of an existing receipt is not permitted.`,
      };
    }

    // 2. Long Common Suffix Check: e.g. 8 or more identical trailing digits
    let commonSuffix = 0;
    while (
      commonSuffix < normalizedId.length &&
      commonSuffix < claimedNormalized.length &&
      normalizedId[normalizedId.length - 1 - commonSuffix] ===
        claimedNormalized[claimedNormalized.length - 1 - commonSuffix]
    ) {
      commonSuffix++;
    }

    if (commonSuffix >= 8 && normalizedId !== claimedNormalized) {
      const masked = `${claimedNormalized.slice(0, 4)}••••${claimedNormalized.slice(-2)}`;
      return {
        isTampered: true,
        matchedClaimedId: claimedNormalized,
        reason: `This ID shares ${commonSuffix} trailing characters with a previously claimed transaction reference (${masked}). Tampering with or changing digits of an existing receipt is not permitted.`,
      };
    }

    // 3. Levenshtein Edit Distance Check: only 1, 2, or 3 edits away
    const distance = calculateLevenshteinDistance(normalizedId, claimedNormalized);
    if (distance > 0 && distance <= 3 && Math.abs(normalizedId.length - claimedNormalized.length) <= 2) {
      const masked = `${claimedNormalized.slice(0, 4)}••••${claimedNormalized.slice(-2)}`;
      return {
        isTampered: true,
        matchedClaimedId: claimedNormalized,
        reason: `This ID is a modified copy (only ${distance} character${distance > 1 ? "s" : ""} different) of an already claimed transaction (${masked}). Please complete your own payment to get a genuine Transaction ID.`,
      };
    }
  }

  return { isTampered: false };
}

/**
 * Checks whether a transaction ID is obviously fake, bogus, or has invalid format
 */
export function isInvalidTransactionFormat(normalizedId: string): { isInvalid: boolean; reason?: string } {
  if (!normalizedId || normalizedId.length < 12) {
    return {
      isInvalid: true,
      reason: "Transaction ID must be at least 12 digits/characters.",
    };
  }

  if (normalizedId.length > 35) {
    return {
      isInvalid: true,
      reason: "Transaction ID is too long (maximum 35 characters).",
    };
  }

  // Must only contain alphanumeric characters, underscores, or hyphens
  if (!/^[A-Z0-9_-]+$/.test(normalizedId)) {
    return {
      isInvalid: true,
      reason: "Transaction ID contains invalid symbols. Only letters, numbers, hyphens, and underscores are allowed.",
    };
  }

  // Reject all identical characters (e.g. 000000000000, 111111111111, XXXXXXXXXXXX)
  if (/^(.)\1{11,}$/.test(normalizedId)) {
    return {
      isInvalid: true,
      reason: "Transaction ID cannot be a repeated single character.",
    };
  }

  // Must have at least 3 distinct characters to be a genuine transaction reference
  const uniqueChars = new Set(normalizedId.replace(/[-_]/g, ""));
  if (uniqueChars.size < 3) {
    return {
      isInvalid: true,
      reason: "Transaction ID is not genuine (too few distinct characters).",
    };
  }

  // Reject known obvious sequential/fake test strings
  const BOGUS_PATTERNS = [
    "123456789012",
    "012345678901",
    "987654321098",
    "123412341234",
    "TESTTESTTEST",
    "ASDFASDFASDF",
    "QWERTYUIOPAS",
    "TRANSACTION1",
    "PAYMENTID123",
  ];

  for (const bogus of BOGUS_PATTERNS) {
    if (normalizedId.includes(bogus)) {
      return {
        isInvalid: true,
        reason: "Invalid or dummy Transaction ID pattern detected.",
      };
    }
  }

  return { isInvalid: false };
}

/**
 * Validates Indian Banking NPCI UPI 12-digit UTR structure (Julian Day & Hour checks)
 */
export function validateNpciUpiUtr(normalizedId: string): { isValid: boolean; reason?: string } {
  // If it's a 12-digit purely numeric ID, check standard Indian Banking Julian encoding
  if (/^\d{12}$/.test(normalizedId)) {
    const yearDigit = parseInt(normalizedId[0], 10);
    // Year digit must be 3 (2023), 4 (2024), 5 (2025), 6 (2026), etc.
    if (yearDigit < 3 || yearDigit > 7) {
      return {
        isValid: false,
        reason: "Invalid UPI year identifier in Transaction ID.",
      };
    }

    const dayOfYear = parseInt(normalizedId.slice(1, 4), 10);
    // Julian Day must be between 1 and 366
    if (dayOfYear < 1 || dayOfYear > 366) {
      return {
        isValid: false,
        reason: "Invalid Julian banking day sequence in Transaction ID.",
      };
    }

    const hour = parseInt(normalizedId.slice(4, 6), 10);
    // Hour must be between 00 and 23
    if (hour > 23) {
      return {
        isValid: false,
        reason: "Invalid banking timestamp batch in Transaction ID.",
      };
    }
  }

  return { isValid: true };
}

/**
 * Checks if a transaction ID has already been used/claimed or is invalid/tampered
 */
export function verifyTransactionUniqueness(rawTxnId: string): TransactionVerificationResult {
  initializeStore();

  const normalized = normalizeTxnId(rawTxnId);

  // 1. Length check: Must be at least 12 characters (GPay is 12 digits, Paytm & Bank can be > 12)
  if (!normalized || normalized.length < 12) {
    return {
      valid: false,
      alreadyUsed: false,
      isInvalidFormat: true,
      errorCode: "TOO_SHORT",
      message: "Transaction ID must be at least 12 digits/characters (e.g. 12-digit UPI UTR or Paytm/Bank reference).",
    };
  }

  if (normalized.length > 35) {
    return {
      valid: false,
      alreadyUsed: false,
      isInvalidFormat: true,
      errorCode: "TOO_LONG",
      message: "Transaction ID is too long (maximum 35 characters).",
    };
  }

  // 2. Format & Bogus / Wrong ID check
  const formatCheck = isInvalidTransactionFormat(normalized);
  if (formatCheck.isInvalid) {
    return {
      valid: false,
      alreadyUsed: false,
      isInvalidFormat: true,
      errorCode: "INVALID_FORMAT",
      message: `The Transaction ID "${rawTxnId.trim()}" is not valid (${formatCheck.reason || "Incorrect format"}). Please check your payment app receipt (Google Pay, Paytm, PhonePe, Bank) and enter the genuine Reference / UTR.`,
    };
  }

  // 3. NPCI Banking UTR Julian timestamp verification for 12-digit numeric IDs
  const npciCheck = validateNpciUpiUtr(normalized);
  if (!npciCheck.isValid) {
    return {
      valid: false,
      alreadyUsed: false,
      isInvalidFormat: true,
      errorCode: "INVALID_FORMAT",
      message: `The Transaction ID "${rawTxnId.trim()}" is not a valid Indian banking UPI UTR (${npciCheck.reason}). Please check your payment receipt and enter the correct 12-digit UTR.`,
    };
  }

  // 4. Duplicate / Already-Claimed check
  const existing = inMemoryTransactions.get(normalized);
  if (existing) {
    const maskedMobile = existing.studentMobile
      ? `${existing.studentMobile.slice(0, 2)}XXXXXX${existing.studentMobile.slice(-2)}`
      : "registered user";
    const dateFormatted = existing.formattedDate || new Date(existing.claimedAt).toLocaleDateString("en-IN");

    return {
      valid: false,
      alreadyUsed: true,
      isInvalidFormat: false,
      errorCode: "DUPLICATE",
      message: `Transaction ID "${rawTxnId.trim()}" is ALREADY USED and verified for "${existing.courseTitle}" by student (${maskedMobile}) on ${dateFormatted}. Each payment reference is unique and can only be used once. Please make a payment first to receive your unique Transaction ID.`,
      record: existing,
    };
  }

  // 5. Anti-Fraud Tamper Detection: Detects if someone changed 1 to 4 digits of a previous transaction!
  const allClaimed = Array.from(inMemoryTransactions.values());
  const tamperCheck = checkTamperedTransaction(normalized, allClaimed);
  if (tamperCheck.isTampered) {
    return {
      valid: false,
      alreadyUsed: false,
      isTampered: true,
      errorCode: "TAMPERED_FRAUD",
      message: `Fraud Security Alert: The Transaction ID "${rawTxnId.trim()}" is an edited/modified copy of a previously used transaction reference (${tamperCheck.reason}). Modifying digits of someone else's receipt is strictly prohibited. Please make a genuine payment of your own.`,
    };
  }

  return {
    valid: true,
    alreadyUsed: false,
    isInvalidFormat: false,
    isTampered: false,
    message: "Transaction ID is unique, verified, and valid for confirmation.",
  };
}

/**
 * Registers a newly verified transaction ID into the ledger
 */
export function registerTransaction(record: TransactionRecord): { success: boolean; message: string; record: TransactionRecord } {
  initializeStore();

  const normalized = normalizeTxnId(record.transactionId);
  if (!normalized || normalized.length < 12 || normalized.length > 35) {
    throw new Error("Invalid Transaction ID: must be between 12 and 35 characters.");
  }

  const formatCheck = isInvalidTransactionFormat(normalized);
  if (formatCheck.isInvalid) {
    throw new Error(`Cannot register invalid Transaction ID: ${formatCheck.reason}`);
  }

  // Check if already registered right before saving
  if (inMemoryTransactions.has(normalized)) {
    const existing = inMemoryTransactions.get(normalized)!;
    throw new Error(
      `Transaction ID "${record.transactionId}" has already been claimed by another student (${existing.studentName}). Duplicate transaction IDs are not allowed.`
    );
  }

  const completeRecord: TransactionRecord = {
    ...record,
    transactionId: record.transactionId.trim(),
    claimedAt: record.claimedAt || Date.now(),
    formattedDate: record.formattedDate || new Date().toLocaleString("en-IN"),
  };

  inMemoryTransactions.set(normalized, completeRecord);
  saveToDisk();

  console.log(`[TransactionStore] Successfully registered unique transaction ${normalized} for "${record.studentName}"`);

  return {
    success: true,
    message: "Transaction successfully locked and registered.",
    record: completeRecord,
  };
}

/**
 * Gets all claimed transactions (for debug / admin view)
 */
export function getAllTransactions(): TransactionRecord[] {
  initializeStore();
  return Array.from(inMemoryTransactions.values()).sort((a, b) => b.claimedAt - a.claimedAt);
}

/**
 * Clears or resets transactions (for development reset if needed)
 */
export function resetTransactions(): void {
  inMemoryTransactions.clear();
  isInitialized = false;
  initializeStore();
}
