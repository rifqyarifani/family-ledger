import { createHash } from "crypto";
import { initialLedgerData } from "@/data/mock-data";
import type {
  Account,
  Budget,
  FamilyMember,
  LedgerData,
  LocalUser,
  SavingsGoal,
  Transaction
} from "@/types/finance";

type StoredUser = {
  firstName: string;
  lastName: string;
  email: string;
  pinHash: string;
};

type ServerDatabase = {
  user: StoredUser | null;
  ledger: LedgerData;
};

type SupabaseStateRow = {
  key: string;
  value: ServerDatabase;
};

const stateKey = "default";
const tableName = "familyledger_app_state";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey
  };
}

function getSupabaseHeaders() {
  const { serviceRoleKey } = getSupabaseConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json"
  };
}

function hashPin(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeLedgerData(value: unknown): LedgerData {
  if (!isRecord(value)) {
    return initialLedgerData;
  }

  const settings = isRecord(value.settings)
    ? {
        ...initialLedgerData.settings,
        ...value.settings,
        currency: "IDR" as const
      }
    : initialLedgerData.settings;

  return {
    transactions: Array.isArray(value.transactions) ? (value.transactions as Transaction[]) : initialLedgerData.transactions,
    budgets: Array.isArray(value.budgets) ? (value.budgets as Budget[]) : initialLedgerData.budgets,
    familyMembers: Array.isArray(value.familyMembers)
      ? (value.familyMembers as FamilyMember[])
      : initialLedgerData.familyMembers,
    accounts: Array.isArray(value.accounts) ? (value.accounts as Account[]) : initialLedgerData.accounts,
    savingsGoals: Array.isArray(value.savingsGoals)
      ? (value.savingsGoals as SavingsGoal[])
      : initialLedgerData.savingsGoals,
    settings
  };
}

function normalizeUser(value: unknown): StoredUser | null {
  if (!isRecord(value)) return null;

  const firstName = typeof value.firstName === "string" ? value.firstName : "";
  const lastName = typeof value.lastName === "string" ? value.lastName : "";
  const email = typeof value.email === "string" ? value.email : "";
  const pinHash =
    typeof value.pinHash === "string"
      ? value.pinHash
      : typeof value.pin === "string"
        ? hashPin(value.pin)
        : "";

  if (!email || !pinHash) return null;

  return { firstName, lastName, email, pinHash };
}

function normalizeDatabase(value: unknown): ServerDatabase {
  if (!isRecord(value)) {
    return { user: null, ledger: initialLedgerData };
  }

  return {
    user: normalizeUser(value.user),
    ledger: normalizeLedgerData(value.ledger)
  };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...getSupabaseHeaders(),
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function createStoredUser(user: LocalUser): StoredUser {
  return {
    firstName: user.firstName.trim(),
    lastName: user.lastName.trim(),
    email: user.email.trim().toLowerCase(),
    pinHash: hashPin(user.pin.trim())
  };
}

export function verifyPin(user: StoredUser, pin: string) {
  return user.pinHash === hashPin(pin.trim());
}

export function toPublicUser(user: StoredUser | null) {
  if (!user) return null;
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
}

export async function readDatabase() {
  const rows = await supabaseRequest<SupabaseStateRow[]>(
    `${tableName}?key=eq.${stateKey}&select=key,value&limit=1`
  );
  const existing = rows[0]?.value;

  if (existing) {
    return normalizeDatabase(existing);
  }

  return writeDatabase({ user: null, ledger: initialLedgerData });
}

export async function writeDatabase(database: ServerDatabase) {
  const normalized = normalizeDatabase(database);

  await supabaseRequest(`${tableName}?on_conflict=key`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({
      key: stateKey,
      value: normalized
    })
  });

  return normalized;
}

export async function updateLedger(ledger: LedgerData) {
  const database = await readDatabase();
  return writeDatabase({
    user: database.user
      ? {
          ...database.user,
          firstName: ledger.settings.profileFirstName,
          lastName: ledger.settings.profileLastName,
          email: ledger.settings.profileEmail.trim().toLowerCase()
        }
      : database.user,
    ledger: normalizeLedgerData(ledger)
  });
}
