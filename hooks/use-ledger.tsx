"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { initialLedgerData } from "@/data/mock-data";
import type {
  Account,
  Budget,
  FamilyMember,
  LedgerData,
  LocalUser,
  SavingsGoal,
  Settings,
  Transaction
} from "@/types/finance";

type PublicUser = Omit<LocalUser, "pin">;

type LedgerContextValue = LedgerData & {
  isReady: boolean;
  isAuthenticated: boolean;
  hasUser: boolean;
  user: PublicUser | null;
  createLocalProfile: (user: LocalUser, householdName: string) => Promise<boolean>;
  signIn: (email: string, pin: string) => Promise<boolean>;
  signOut: () => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (member: FamilyMember) => void;
  deleteFamilyMember: (id: string) => void;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  importData: (data: LedgerData) => void;
  resetData: () => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function saveLedger(data: LedgerData) {
  void requestJson<{ ledger: LedgerData }>("/api/ledger", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LedgerData>(initialLedgerData);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [hasUser, setHasUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const status = await requestJson<{
          hasUser: boolean;
          user: PublicUser | null;
          ledger: LedgerData;
        }>("/api/auth/status");

        if (!isMounted) return;

        setHasUser(status.hasUser);
        setUser(status.user);
        setData(status.ledger);
      } catch {
        if (!isMounted) return;
        setData(initialLedgerData);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const commitData = useCallback((updater: (current: LedgerData) => LedgerData) => {
    setData((current) => {
      const next = updater(current);
      saveLedger(next);
      return next;
    });
  }, []);

  const value = useMemo<LedgerContextValue>(
    () => ({
      ...data,
      isReady,
      isAuthenticated,
      hasUser,
      user,
      createLocalProfile: async (nextUser, householdName) => {
        try {
          const result = await requestJson<{ user: PublicUser; ledger: LedgerData }>("/api/auth/setup", {
            method: "POST",
            body: JSON.stringify({ user: nextUser, householdName })
          });

          setUser(result.user);
          setHasUser(true);
          setIsAuthenticated(true);
          setData(result.ledger);
          return true;
        } catch {
          return false;
        }
      },
      signIn: async (email, pin) => {
        try {
          const result = await requestJson<{ user: PublicUser; ledger: LedgerData }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, pin })
          });

          setUser(result.user);
          setHasUser(true);
          setIsAuthenticated(true);
          setData(result.ledger);
          return true;
        } catch {
          return false;
        }
      },
      signOut: () => setIsAuthenticated(false),
      addTransaction: (transaction) =>
        commitData((current) => ({
          ...current,
          transactions: [transaction, ...current.transactions]
        })),
      updateTransaction: (transaction) =>
        commitData((current) => ({
          ...current,
          transactions: current.transactions.map((item) => (item.id === transaction.id ? transaction : item))
        })),
      deleteTransaction: (id) =>
        commitData((current) => ({
          ...current,
          transactions: current.transactions.filter((item) => item.id !== id)
        })),
      addBudget: (budget) =>
        commitData((current) => ({
          ...current,
          budgets: [budget, ...current.budgets]
        })),
      updateBudget: (budget) =>
        commitData((current) => ({
          ...current,
          budgets: current.budgets.map((item) => (item.id === budget.id ? budget : item))
        })),
      deleteBudget: (id) =>
        commitData((current) => ({
          ...current,
          budgets: current.budgets.filter((item) => item.id !== id)
        })),
      addFamilyMember: (member) =>
        commitData((current) => ({
          ...current,
          familyMembers: [member, ...current.familyMembers]
        })),
      updateFamilyMember: (member) =>
        commitData((current) => ({
          ...current,
          familyMembers: current.familyMembers.map((item) => (item.id === member.id ? member : item))
        })),
      deleteFamilyMember: (id) =>
        commitData((current) => ({
          ...current,
          familyMembers: current.familyMembers.filter((item) => item.id !== id),
          transactions: current.transactions.filter((transaction) => transaction.memberId !== id)
        })),
      addAccount: (account) =>
        commitData((current) => ({
          ...current,
          accounts: [account, ...current.accounts]
        })),
      updateAccount: (account) =>
        commitData((current) => ({
          ...current,
          accounts: current.accounts.map((item) => (item.id === account.id ? account : item))
        })),
      deleteAccount: (id) =>
        commitData((current) => ({
          ...current,
          accounts: current.accounts.filter((item) => item.id !== id),
          transactions: current.transactions.filter(
            (transaction) => transaction.accountId !== id && transaction.transferAccountId !== id
          )
        })),
      addSavingsGoal: (goal) =>
        commitData((current) => ({
          ...current,
          savingsGoals: [goal, ...current.savingsGoals]
        })),
      updateSavingsGoal: (goal) =>
        commitData((current) => ({
          ...current,
          savingsGoals: current.savingsGoals.map((item) => (item.id === goal.id ? goal : item))
        })),
      deleteSavingsGoal: (id) =>
        commitData((current) => ({
          ...current,
          savingsGoals: current.savingsGoals.filter((item) => item.id !== id)
        })),
      updateSettings: (settings) => {
        setUser((current) =>
          current
            ? {
                ...current,
                firstName: settings.profileFirstName,
                lastName: settings.profileLastName,
                email: settings.profileEmail.trim().toLowerCase()
              }
            : current
        );
        commitData((current) => ({
          ...current,
          settings
        }));
      },
      importData: (importedData) => {
        setData(importedData);
        saveLedger(importedData);
      },
      resetData: () => {
        setData(initialLedgerData);
        saveLedger(initialLedgerData);
      }
    }),
    [commitData, data, hasUser, isAuthenticated, isReady, user]
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const context = useContext(LedgerContext);

  if (!context) {
    throw new Error("useLedger must be used inside LedgerProvider");
  }

  return context;
}
