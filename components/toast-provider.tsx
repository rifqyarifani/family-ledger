"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { Toast, type ToastTone } from "@/components/toast";
import { useAnnounce } from "@/hooks/use-announce";

const AUTO_DISMISS_MS = 4000;
const MAX_TOASTS = 3;

type ToastEntry = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ShowToastInput = {
  tone?: ToastTone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;
function nextToastId() {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const announce = useAnnounce();

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (input: ShowToastInput) => {
      const id = nextToastId();
      const entry: ToastEntry = {
        id,
        tone: input.tone ?? "info",
        title: input.title,
        description: input.description
      };

      setToasts((current) => {
        const next = [...current, entry];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      const fullMessage = input.description ? `${input.title}. ${input.description}` : input.title;
      announce(fullMessage);

      const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismissToast, announce]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && toasts.length > 0) {
        dismissAll();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toasts.length, dismissAll]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast, dismissAll }),
    [showToast, dismissToast, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            tone={toast.tone}
            title={toast.title}
            description={toast.description}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
