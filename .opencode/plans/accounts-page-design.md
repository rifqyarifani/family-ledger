# Accounts Page — DESIGN.md alignment

## 1. `components/card.tsx`

**Changes:**
- Remove `border border-[#cfd5ca]` — DESIGN.md says card elevation comes from surface contrast (white on sage), not borders
- Remove `shadow-soft` — same reason
- Update `p-5` → `p-6` — DESIGN.md `spacing.xl` = 24px = `p-6`

**Old:**
```tsx
<section className={cn("min-w-0 rounded-3xl border border-[#cfd5ca] bg-white p-5 shadow-soft", className)}>
```

**New:**
```tsx
<section className={cn("min-w-0 rounded-3xl bg-white p-6", className)}>
```

## 2. `app/app/accounts/accounts-client.tsx`

### a. Remove `Badge` import
Delete line: `import { Badge } from "@/components/badge";`

### b. Replace account type badge with DESIGN.md badge-positive style
**Old:**
```tsx
<div className="mt-1 capitalize">
  <Badge tone="blue">{account.type}</Badge>
</div>
```

**New:**
```tsx
<div className="mt-1">
  <span className="inline-block rounded-full bg-[#e2f6d5] px-3 py-0.5 text-xs font-semibold text-[#054d28] capitalize">
    {account.type}
  </span>
</div>
```

### c. Update balance typography to DESIGN.md display-xs
**Old:**
```tsx
<p className="text-2xl font-semibold text-[#0e0f0c]">
```

**New:**
```tsx
<p className="text-2xl font-semibold leading-[31.2px] tracking-[-0.48px] text-[#0e0f0c]">
```

## 3. Build check

```bash
npm run build
```
