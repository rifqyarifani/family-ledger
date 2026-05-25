import { cn } from "@/lib/utils";

export function getProfileName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Family Profile";
}

export function getProfileInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "FL";
}

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className
}: {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-slate-800 to-blue-600 font-semibold text-white shadow-sm ring-2 ring-white",
        size === "sm" && "h-9 w-9 text-xs",
        size === "md" && "h-11 w-11 text-sm",
        size === "lg" && "h-16 w-16 text-lg",
        className
      )}
      aria-hidden="true"
    >
      {getProfileInitials(firstName, lastName)}
    </span>
  );
}
