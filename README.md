# FamilyLedger

FamilyLedger is a modern family financial management web and native iOS app for manually recording and managing household income, expenses, budgets, savings goals, family members, accounts, and reports.

This MVP does not connect to banks, payment APIs, or external financial services. Data is entered manually.

Authentication uses Supabase Auth with `/login`, `/signup`, and protected `/app` routes. Accounts, categories, transactions, savings goals, budgets, family members, dashboard summaries, and reports now use Supabase for each active household.

## Features

- Dashboard with Supabase-backed total balance, monthly income, monthly expenses, savings rate, cashflow trend, spending breakdown, and recent transactions.
- Public landing page with Supabase Auth login and local-development signup that does not send confirmation emails.
- First-login household onboarding where users can create a household or join an existing household by code.
- Persistent short household invite codes shown after onboarding and in Settings > Household, with one-click copy.
- Protected dashboard routes under `/app`.
- Transactions page loaded from Supabase with add, edit, delete, transfers between accounts, default member selection from the logged-in user, search, and filters for date range, type, category, member, and account. The Add Transaction form and the Account filter use a 2-level account picker grouped by Shared and per-member, mirroring the Accounts page.
- Categories page loaded from Supabase with add, edit, and delete actions for income and expense categories. Deleting a category keeps transactions but clears their category assignment; budgets keyed on that category lose their target.
- Budget page loaded from Supabase with expense-category limits, spent amount, remaining amount, percentage used, progress bars, and a custom month picker.
- Reports page with Supabase-backed income vs expense, net cashflow, spending by category, and expense by member.
- Family page loaded from Supabase for household members and member-level spending or contribution summaries.
- Accounts page for cash, bank, credit, and savings accounts loaded from Supabase with create, edit, and delete actions protected by household RLS. Deleting an account requires no linked transactions; linked savings goals cascade automatically. Each account can be marked Shared (owned by the whole household) or Private (owned by a specific member), and the page groups accounts into "Shared" and per-member sections.
- Savings Goals page loaded from Supabase with create, edit, delete, target amount, due date, and progress tracked from a selected savings account.
- Polished forms with per-field validation, Indonesian amount formatting, 30-character caps for key names/titles, and custom date picker controls.
- Header profile menu with quick access to a settings popup and logout confirmation.
- Settings popup with left navigation for Profile and Household. Profile and household settings save to Supabase.
- Native SwiftUI iOS app with authentication, household onboarding, dashboard, transaction and transfer management, accounts, budgets, savings goals, reports, category and family management, and settings.
- Authenticated `/api/mobile/v1` backend-for-frontend routes that keep household financial data access and privileged Supabase operations server-side.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspired reusable components
- lucide-react icons
- Recharts
- Supabase Postgres database
- Supabase Auth helpers for browser, server, middleware session refresh, and household onboarding
- Server Actions for Supabase-backed mutations
- SwiftUI iOS 17 app generated with XcodeGen
- Native URLSession client using Supabase Auth and the versioned mobile API

## Design Direction

UI work should follow [DESIGN.md](/Users/rifqyarifani/Documents/FamilyLedger/DESIGN.md). The shared components use its Wise-inspired palette: near-black ink, lime primary actions, sage-tinted surfaces, rounded cards, and compact fintech dashboard typography.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run [supabase/schema.sql](/Users/rifqyarifani/Documents/FamilyLedger/supabase/schema.sql), then [supabase/rls.sql](/Users/rifqyarifani/Documents/FamilyLedger/supabase/rls.sql).
3. Optionally run [supabase/seed.sql](/Users/rifqyarifani/Documents/FamilyLedger/supabase/seed.sql) after replacing the demo user IDs with real Supabase Auth user IDs.
4. Copy `.env.example` to `.env`.
5. Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not expose it in client components.

In Supabase Auth settings, add `http://localhost:3000/auth/callback` as an allowed redirect URL for local development.

For an existing Supabase project, run [supabase/production-readiness.sql](/Users/rifqyarifani/Documents/FamilyLedger/supabase/production-readiness.sql) in the SQL Editor before deploying this version. It backfills unique invite codes, tightens owner-only household management policies, refreshes RLS policies, and grants Data API access to authenticated users.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Run the iOS App

The native project is in [ios/FamilyLedger](/Users/rifqyarifani/Documents/FamilyLedger/ios/FamilyLedger).

1. Install full Xcode and XcodeGen.
2. Copy the local configuration:

```bash
cp ios/FamilyLedger/Config/Local.xcconfig.example ios/FamilyLedger/Config/Local.xcconfig
```

3. Set the deployed or local mobile API URL, Supabase URL, and Supabase publishable key in `Local.xcconfig`. Never put a secret or service-role key in the iOS app.
4. Generate and open the project:

```bash
cd ios/FamilyLedger
xcodegen generate
open FamilyLedger.xcodeproj
```

For Simulator development against the local Next.js server, keep `MOBILE_API_BASE_URL` set to `http://localhost:3000/api/mobile/v1` and run `npm run dev` from the repository root.

## Checks

```bash
npm run lint
npm run test
npm run build
npm run start
swiftc -parse ios/FamilyLedger/App/*.swift ios/FamilyLedger/Core/*.swift ios/FamilyLedger/Features/*.swift
cd ios/FamilyLedger && xcodegen generate
```

## Future Improvements

- Supabase Realtime subscriptions for live multi-device updates.
- Dedicated transfer shortcuts from account cards.
- Expanded role-based permissions beyond owner/member.
- Recurring transactions.
- CSV import and export templates.
- More report filters and printable summaries.
- Dark theme implementation.
- Optional real-time household collaboration with Supabase Realtime.
