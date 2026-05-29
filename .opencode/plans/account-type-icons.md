# Account type icons

**File:** `app/app/accounts/accounts-client.tsx`

**Changes:**

### 1. Update import
Add `Banknote, Building, PiggyBank` to the `lucide-react` import:
```tsx
import { Banknote, Building, CreditCard, PiggyBank, Plus } from "lucide-react";
```

### 2. Add icon map before the return statement (~line 53)
```tsx
const typeIcon: Record<Account["type"], typeof CreditCard> = {
  cash: Banknote,
  bank: Building,
  credit: CreditCard,
  savings: PiggyBank,
};
```

### 3. Replace hardcoded CreditCard with dynamic icon (`~line 78-79`)
**Old:**
```tsx
<CreditCard className="h-5 w-5" aria-hidden="true" />
```

**New:**
```tsx
const Icon = typeIcon[account.type];
<Icon className="h-5 w-5" aria-hidden="true" />
```

### 4. Build check
```bash
npm run build
```
