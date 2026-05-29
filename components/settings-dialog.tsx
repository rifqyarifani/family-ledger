"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Home, UserRound, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/form-field";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";
import type { Settings } from "@/types/finance";
import {
  updateHouseholdSettingsAction,
  updateProfileAction,
} from "@/app/app/profile-actions";

type SettingsSection = "profile" | "household";

const settingsNavItems: Array<{
  id: SettingsSection;
  label: string;
  icon: typeof UserRound;
}> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "household", label: "Household", icon: Home },
];

export function SettingsDialog({
  open,
  onClose,
  profile,
  householdName,
  householdCode,
  monthlyCycleDay,
  householdRole,
}: {
  open: boolean;
  onClose: () => void;
  profile: {
    email: string | null;
    firstName: string;
    lastName: string;
    displayName: string;
  } | null;
  householdName: string;
  householdCode: string;
  monthlyCycleDay: number;
  householdRole: "owner" | "member";
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [formValues, setFormValues] = useState<Settings>({
    householdName,
    profileFirstName: profile?.firstName ?? "",
    profileLastName: profile?.lastName ?? "",
    profileEmail: profile?.email ?? "",
    profilePlan: "Family",
    currency: "IDR",
    monthlyCycleDay,
    themePreference: "system",
  });
  const [message, setMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const householdCodeRef = useRef<HTMLParagraphElement>(null);

  useFocusTrap(dialogRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    setFormValues({
      householdName,
      monthlyCycleDay,
      profileFirstName: profile?.firstName ?? "",
      profileLastName: profile?.lastName ?? "",
      profileEmail: profile?.email ?? "",
      profilePlan: "Family",
      currency: "IDR",
      themePreference: "system",
    });
    setMessage("");
    setCopiedCode(false);
    setActiveSection("profile");
  }, [open, profile, householdName, householdCode, monthlyCycleDay]);

  if (!open) {
    return null;
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeSection === "profile") {
      startTransition(async () => {
        const result = await updateProfileAction({
          firstName: formValues.profileFirstName,
          lastName: formValues.profileLastName,
        });
        setMessage(result.message);
        if (result.ok) {
          router.refresh();
        }
      });
      return;
    }

    if (activeSection === "household") {
      updateHouseholdSettingsAction({
        householdName: formValues.householdName,
      }).then((result) => {
        setMessage(result.message);
        if (result.ok) {
          router.refresh();
        }
      });
      return;
    }

    setMessage("Choose a settings section to update.");
  }

  async function copyHouseholdCode() {
    if (!householdCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(householdCode);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();

      if (householdCodeRef.current && selection) {
        range.selectNodeContents(householdCodeRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      setMessage("Code selected. Press Command+C or Ctrl+C to copy.");
      return;
    }

    setCopiedCode(true);
    setMessage("");
    window.setTimeout(() => setCopiedCode(false), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand/50 p-3 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div ref={dialogRef} className="my-4 grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl sm:my-0 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-surface bg-surface-subtle p-4 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-3 md:block">
            <div>
              <h2 className="text-xl font-semibold text-ink">Settings</h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Manage your profile and workspace.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
              aria-label="Close settings"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <nav className="mt-5 flex gap-2 overflow-x-auto md:grid md:overflow-visible">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition md:w-full",
                    activeSection === item.id
                      ? "bg-brand text-white"
                      : "text-ink-secondary hover:bg-white hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-h-[520px] p-5 md:p-6">
          <div className="mb-5 hidden items-start justify-between gap-4 md:flex">
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {
                  settingsNavItems.find((item) => item.id === activeSection)
                    ?.label
                }
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close settings"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {message ? (
            <p className="mb-4 rounded-2xl border border-surface-border bg-surface-subtle p-3 text-sm text-ink-secondary">
              {message}
            </p>
          ) : null}

          <form onSubmit={saveSettings} className="grid gap-5">
            {activeSection === "profile" ? (
              <div className="grid gap-5">
                <div className="flex items-center gap-4 rounded-2xl border border-surface-border p-4">
                  <Avatar
                    firstName={formValues.profileFirstName}
                    lastName={formValues.profileLastName}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-ink">
                      {formValues.profileFirstName}{" "}
                      {formValues.profileLastName}
                    </p>
                    <p className="text-sm text-ink-secondary">Family profile</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name">
                    <Input
                      value={formValues.profileFirstName}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          profileFirstName: event.target.value,
                        }))
                      }
                      maxLength={30}
                      required
                    />
                  </Field>
                  <Field label="Last name">
                    <Input
                      value={formValues.profileLastName}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          profileLastName: event.target.value,
                        }))
                      }
                      maxLength={30}
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={formValues.profileEmail}
                      readOnly
                      required
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {activeSection === "household" ? (
              <div className="grid gap-4">
                <div className="rounded-2xl border border-surface-border bg-surface-subtle p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-secondary">
                        Household code
                      </p>
                      <p
                        ref={householdCodeRef}
                        className="mt-2 select-all font-mono text-lg font-semibold tracking-wide text-ink"
                      >
                        {householdCode || "Code not available"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={copyHouseholdCode}
                      disabled={!householdCode}
                      className="w-full sm:w-auto"
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copiedCode ? "Copied" : "Copy code"}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Household name">
                    <Input
                      value={formValues.householdName}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          householdName: event.target.value,
                        }))
                      }
                      readOnly={householdRole !== "owner"}
                      required
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-surface pt-5 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
