# Plan: Complete App Store Connect Paid Apps Agreement

## Current Status
- Free Apps Agreement: **Active**
- Paid Apps Agreement: **Pending User Info**
- W-8BEN tax form: **Submitted, in progress**
- Bank account: **NOT added**
- DSA (Digital Services Act): **In Review**

## What You Need Before Starting

Have these ready before you sit down:

| Info | Where to find it |
|------|-------------------|
| Bank IBAN | Your banking app or statement |
| Bank account number (with ALL leading zeros) | Your banking app |
| SWIFT/BIC code | Your banking app or bank's website |
| Account holder name **exactly** as on bank records | Your banking app |
| Your country's tax ID number (optional but recommended) | Government tax portal |
| Residential address | Same as on developer account |

---

## Step 1: Check Tax Form Status (2 min)

1. Go to [App Store Connect](https://appstoreconnect.apple.com) > **Business** > **Agreements** tab
2. Find the **Tax Forms** section under Paid Apps
3. Check your W-8BEN status:
   - **Processing** → wait (usually hours, can take up to 24h)
   - **Active/Complete** → proceed to Step 2
   - **Expired/Rejected** → resubmit (see troubleshooting below)

> Tax forms must be processed BEFORE adding a bank account. If still processing, come back later.

---

## Step 2: Add Bank Account (5-10 min)

1. In **Business** > **Agreements** tab, find the **Bank Accounts** section
2. Click **Add Bank Account** (or the **+** button)
3. Complete 2FA if prompted

### Fill in the fields:

| Field | What to enter |
|-------|---------------|
| **Bank Country/Region** | Your bank's country (e.g., Serbia) |
| **Bank Name** | Search by name, city, or postal code |
| **IBAN** | Your full IBAN — copy-paste from banking app to avoid typos |
| **Bank Account Number** | Your account number — **separate from IBAN**, include ALL leading zeros |
| **SWIFT/BIC Code** | 8 or 11 characters |
| **Bank Account Currency** | Must match your actual account currency (e.g., RSD, EUR) |
| **Account Type** | Checking (most common) or Savings |
| **Account Holder Name** | **Exactly** as on your bank records — character-for-character |
| **Account Holder Type** | Individual |
| **Account Holder Address** | Your residential address |

4. Check the agreement checkbox
5. Click **Add**

### Common mistakes to avoid:
- **Don't mix IBAN and account number** — they are separate fields
- **Don't drop leading zeros** from account number
- **Name must match bank records exactly** — not your Apple developer name
- **Copy-paste IBAN** from your banking app — one wrong digit = validation error

---

## Step 3: Wait for Processing (1-3 hours typical)

After both tax form and bank account are submitted:

1. Agreement status changes to **Processing**
2. Typical wait: **1-3 hours**
3. Worst case: **24-48 hours**
4. Check back periodically — refresh the Business page

### Status progression:
```
Pending User Info → Processing → Active
```

### If stuck > 48 hours:
- Contact [Apple Developer Support](https://developer.apple.com/contact/)
- Select "App Store Connect" > "Agreements, Tax, and Banking"
- Known issue: bank account can get stuck in a tax/banking circular dependency
- Support usually resolves it within hours of the ticket

---

## Step 4: Verify Everything is Active (2 min)

Once status shows **Active** (green dot), confirm:

1. **Paid Apps Agreement**: Active (green dot)
2. **Free Apps Agreement**: Active (green dot)
3. **Tax Forms**: Complete/Active
4. **Bank Account**: Active (not "Processing")

---

## Step 5: Test Sandbox Purchases (15 min)

Once agreement is Active:

1. **Wait 15 minutes** after agreement activation for server propagation
2. On your iPhone: **Settings** > scroll to bottom > **App Store** > **Sandbox Account** (at the very bottom) > sign in with your sandbox tester credentials
3. Install your dev build (already built via `eas build --profile development`)
4. Open the app, go through onboarding to the paywall
5. Tap "Start Free Trial" (annual) or "Subscribe Weekly"
6. Sandbox purchase prompt should appear
7. Authenticate with your sandbox account credentials

### If products return empty / purchase fails:

Checklist (in order):
- [ ] Paid Apps Agreement status is **Active** (not Processing)
- [ ] Products in ASC have status **"Ready to Submit"** (need display name, description, screenshot, review notes)
- [ ] Product IDs in code (`clip2fit.weekly`, `clip2fit.annual`) exactly match ASC
- [ ] Bundle ID `com.lazarspasic96.clip2fit` matches ASC
- [ ] In-App Purchase capability enabled in Xcode Signing & Capabilities
- [ ] Waited 15+ minutes after any ASC changes
- [ ] Sandbox tester account is verified (check email)
- [ ] Not signed into a production Apple ID in sandbox section

---

## Alternative: StoreKit Local Testing (No Agreement Needed)

You already have `ios/Clip2FitProducts.storekit` created. Use this while waiting:

1. Open Xcode: `open ios/clip2fit.xcworkspace`
2. **Product** > **Scheme** > **Edit Scheme** > **Run** > **Options**
3. Set **StoreKit Configuration** to `Clip2FitProducts.storekit`
4. Run on simulator — purchases work locally without any ASC setup
5. This bypasses Apple servers entirely — good for UI testing, not for real server validation

---

## Timeline Estimate

| Step | Time |
|------|------|
| Check tax form status | 2 min |
| Add bank account | 5-10 min |
| Wait for Processing → Active | 1-3 hours (up to 48h) |
| Verify + test sandbox | 15-30 min |
| **Total** | **~2-4 hours** (mostly waiting) |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| IBAN validation error | Copy-paste from banking app, check digit count |
| "Bank account number does not match IBAN" | They're separate values — don't enter IBAN as account number |
| Bank not found in search | Try searching by city or postal code |
| Tax form stuck in Processing > 24h | Contact Apple Developer Support |
| Bank account stuck in Processing > 48h | Contact Apple Developer Support — known backend issue |
| Sandbox purchases return empty products | Check the full checklist in Step 5 above |
| "Cannot connect to iTunes Store" in sandbox | Apple sandbox outages are common — wait and retry |

---

## After Agreement is Active → Phase 6

Once sandbox testing confirms purchases work:
1. PostHog analytics events
2. Terms of Service + Privacy Policy pages
3. TestFlight build
4. App Store submission

See `HANDOFF.md` Phase 6 for full details.
