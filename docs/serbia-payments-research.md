# Payments & Monetization Research — Serbia

## Context

Clip2Fit is a mobile app (iOS + Android) with monthly subscriptions. Serbia does not support Stripe. This document covers all payment options, tax obligations, and community resources.

---

## 1. Mobile App Subscriptions (Primary Path)

### Apple App Store — Fully Supports Serbia

- Serbia became official storefront **April 2020**
- Commission: **15%** (Small Business Program, under $1M/year)
- Payouts: **Direct to Serbian bank account** via EFT (IBAN)
- Paid monthly, ~45 days after fiscal month end
- Developer Program: **$99/year**
- Enroll as **individual** — no business entity required
- Bank account name must match Developer account name exactly
- Apple pays from **Apple Distribution International Ltd.** (Cork, Ireland)

### Google Play — Fully Supports Serbia

- Serbia is a supported merchant location
- Commission: **15%** on subscriptions from day one
- Payouts: **Wire transfer to Serbian bank account** (5-7 business days)
- Developer account: **$25 one-time**

### RevenueCat — Works in Serbia

- Wraps Apple/Google subscriptions — not a payment processor
- Unified SDK, paywall A/B testing, analytics, receipt validation
- **Free up to $2,500/month** tracked revenue, then 1% of revenue
- Works because Apple and Google both support Serbia

### Recommended Stack

```
iOS subscription  → Apple IAP  → Apple pays Serbian bank
Android subscription → Google Play Billing → Google pays Serbian bank
RevenueCat wraps both → unified dashboard
```

Total cost: ~16% of revenue (15% store + ~1% RevenueCat).

---

## 2. Receiving Payments on a Personal Account

### Apple Can Pay to Personal Bank Account

- Enroll as **individual** (not organization)
- Enter personal IBAN (RS35...) + SWIFT/BIC in App Store Connect
- Name on bank account must match Developer account exactly
- No business account required

### What Happens When Money Arrives

1. Apple sends wire transfer from Ireland
2. Serbian bank contacts you to sign **izjava** (statement) declaring payment basis
3. You provide payment code (sifra osnova naplate)
4. Money lands in your account

This is legal under Serbian foreign exchange law (Zakon o deviznom poslovanju).

---

## 3. Tax Obligations — Freelancer Self-Taxation

### No Business Registration Needed

Since the 2020-2021 freelancer tax crisis and resulting law changes, Serbia has a dedicated **freelancer self-taxation portal**: **frilenseri.purs.gov.rs**

### Two Taxation Models (choose each quarter)

#### Model A (better for lower income)

| Item | Amount |
|------|--------|
| Non-taxable quarterly amount (2025) | 107,738 RSD (~920 EUR) |
| Tax rate | 20% on amount above deduction |
| Pension (PIO) | 24% on taxable amount |
| Health insurance | 10.3% (waived if employed elsewhere) |

#### Model B (better for higher income)

| Item | Amount |
|------|--------|
| Deduction | 64,979 RSD + 34% of gross income |
| Tax rate | 10% on remaining |
| Pension (PIO) | 24% (minimum ~25,218 RSD/quarter) |
| Health insurance | 10.3% (waived if employed) |

### Example: 1,000 EUR/quarter, employed elsewhere

**Model A**: ~4,075 RSD (~35 EUR) total
**Model B**: ~26,442 RSD (~226 EUR) total — minimum PIO floor makes it expensive

Under ~920 EUR/quarter → **zero tax** with Model A.

### Filing Deadlines

- Q1 (Jan-Mar): April 30
- Q2 (Apr-Jun): July 30
- Q3 (Jul-Sep): October 30
- Q4 (Oct-Dec): January 30

### Annual Tax

If net income exceeds ~4.87M RSD (~41,500 EUR/year), additional annual tax applies. Under-40 bonus: extra 3x average salary deduction.

---

## 4. Setup Steps

### One-Time

1. Enroll in Apple Developer Program as individual ($99/year)
2. Enter personal IBAN + SWIFT in App Store Connect
3. Sign **W-8BEN** tax form in App Store Connect (prevents US withholding)
4. Get **Consent ID** at any Posta Srbije (bring licna karta)
5. Register on **frilenseri.purs.gov.rs**

### Every Quarter

6. Log into portal, enter gross income
7. Choose Model A or B
8. Submit **PP OPO-K** form
9. Pay via QR code (mobile banking)

---

## 5. Legal Details

### Double Taxation

- Serbia has a **DTA with Ireland** (where Apple pays from) — no double taxation
- Serbia has a DTA with the US as well
- Apple typically does not withhold tax when DTA exists

### Bank Reporting

- Banks do NOT auto-report to tax authority
- Tax authority CAN request records at any time
- Increasingly cross-referencing since 2021 freelancer crackdown

### Penalties for Not Reporting

- Failure to file: 5,000–150,000 RSD fine
- Late payment interest: central bank rate + 10% annually
- Tax evasion (>1M RSD): 1–5 years imprisonment
- Tax evasion (>5M RSD): 2–8 years imprisonment
- Unregistered business activity: 50,000–500,000 RSD fine

### Foreign Exchange Rules

- Individuals CAN receive foreign currency on personal accounts
- No legal limit on amount
- Large/unusual transfers may trigger AML scrutiny
- For transfers under 1,000 EUR with same basis, bank accepts standing instruction

---

## 6. When to Register a Business

| Income Level | Best Option |
|---|---|
| Under ~920 EUR/quarter | Freelancer portal, Model A (zero tax) |
| 920–4,000 EUR/quarter | Freelancer portal, Model A or B |
| ~50K+ EUR/year | Register as **pausalac** (flat monthly tax ~15-25K RSD) |
| 100K+ EUR/year | Register **DOO** + IP Box regime (effective **3% tax**) |

### Pausalac (Flat-Rate Entrepreneur)

- Register with APR
- Fixed monthly tax regardless of earnings
- Annual revenue limit: 6M RSD (~51K EUR)
- VAT registration at 8M RSD

### DOO + IP Box

- Corporate tax: 15% (standard)
- IP Box: **80% exclusion** on qualified software income → effective **3% tax**
- Requires registered legal entity
- One of most favorable IP tax regimes in Europe

---

## 7. Web Subscription Options (If Needed Later)

Stripe is NOT available in Serbia. Alternatives:

### Merchant of Record Services (No Business Registration Needed)

| Service | Fees | Serbia Support | Notes |
|---------|------|----------------|-------|
| **Lemon Squeezy** | 5% + $0.50 + 1.5% intl | Confirmed bank payouts | Acquired by Stripe in 2024 |
| **Paddle** | 5% + $0.50 | Supported (pays worldwide) | Most recommended in forums |
| **Dodo Payments** | 4% + $0.40 | 220+ countries | Built for emerging markets |
| **FastSpring** | Custom | Supported (VAT since 2021) | Software/digital focused |
| **2Checkout (Verifone)** | Varies | Confirmed | 200+ countries |
| **Creem** | Varies | Serbia listed | Newer option |
| **Polar.sh** | 5% + $0.50 | 200+ countries | Uses Stripe Connect |

### Payment Bridges

| Service | Status | Notes |
|---------|--------|-------|
| **Payoneer** | Fully operational, NBS endorsed | Popular with Serbian freelancers |
| **PayPal** | Partial — can receive, high fees | 3.5% commission + $4 withdrawal + bad FX rates |
| **Wise** | NOT available in Serbia | Do not use |

### Stripe Workarounds

| Method | Cost | Notes |
|--------|------|-------|
| **Stripe Atlas** (US LLC) | $500 setup + annual fees | Full Stripe access, US tax obligations |
| **UK Ltd** (via Incorpuk etc.) | ~$300 | Wise + Stripe UK |
| **Estonia e-Residency** | ~$100 + company fees | EU company, access Stripe EU |

### Local Serbian Processors (Domestic Only)

- **AllSecure** — Serbian domestic, limited for SaaS
- **ChipCard** — RSD only, eCommerce
- **CorvusPay** — Balkans-focused, recurring payments

---

## 8. Community Discussions & Resources

### Indie Hackers

- [Serbian developer asks for Stripe alternatives](https://www.indiehackers.com/post/i-need-help-is-there-a-good-stripe-alternative-a90d0fe438) — Uros Nikolic from Serbia, Paddle most recommended
- [Stripe from unsupported country](https://www.indiehackers.com/post/stripe-from-an-unsupported-country-b70eea3a19) — Estonia e-Residency suggested
- [List of all Stripe alternatives](https://www.indiehackers.com/post/i-made-a-list-of-all-stripe-alternatives-a9cb6b597e) — links to stripealternatives.com
- [Accepting payment as individual in SaaS](https://www.indiehackers.com/post/accepting-payment-as-a-individual-in-saas-app-6b1673c8c0) — Paddle works for individuals

### Serbian Forums & Blogs

- [XboxRepublika: Help opening Stripe account](https://xboxrepublika.com/t/pomoc-oko-otvaranja-stripe-naloga/17564) — advised US LLC or PayPal
- [McCann Talks: How to open Stripe from Serbia](https://www.mccann-talks.rs/kako-otvoriti-stripe-nalog-iz-srbije/) — comprehensive guide
- [UXer Friendly: Top 11 Stripe alternatives in Serbia](https://uxerfriendly.com/blog/best-stripe-alternatives-in-serbia?lang=en)
- [UXer Friendly: Best ways to open Stripe in Serbia 2025](https://uxerfriendly.com/blog/best-ways-to-open-stripe-in-serbia-guide?lang=en)
- [Netokracija: Stripe Atlas experience (Shootset)](https://www.netokracija.rs/stripe-atlas-shootset-136989)
- [Startit: First Stripe Atlas partner in Serbia](https://startit.rs/otvaranje-firme-amerika-stripe-atlas-srbija/)
- [Startit: Payment collection in Serbia](https://startit.rs/placanje-mobilnim-telefonom-srbija/)
- [Startit: iPay — Serbia's PayPal alternative](https://startit.rs/srbija-ipay-online-placanje-paypal-nbs/)
- [PIB Akademija: How to open Stripe](https://pib-akademija.com/kako-otvoriti-stripe-nalog/) — Wise + Stripe UK workaround

### Shopify Community

- [Payment gateway for Serbia](https://community.shopify.com/c/shopify-discussions/payment-gateway-for-serbia/td-p/2974875) — only PayPal worked, 2Checkout denied

### OffshoreCorp Talk

- [Serbian freelancer offshore solution](https://www.offshorecorptalk.com/threads/help-needed-with-offshore-solution-for-a-freelancer-from-a-non-eu.24078/) — discusses tax burden, Payoneer concerns

### Medium

- [Passive Income from Serbia](https://medium.com/@marija.stojanovic08/passive-income-from-serbia-heres-what-actually-works-and-what-s-a-waste-of-time-ddf360de351a) — payment system challenges

### Dev.to / HackerNoon / DevMystify

- [Indie Hacker's Guide to Global Payments](https://dev.to/sammaji/the-indie-hackers-guide-to-global-payments-2h1d)
- [Choosing a Merchant of Record 2025](https://devmystify.com/blog/choosing-a-merchant-of-record-in-2025-lemon-squeezy-vs-paddle-vs-dodo-payments-my-experience)
- [Accept Global Payments When Stripe is Blocked](https://www.nxgntools.com/blog/payment-processors-stripe-blocked-countries)

### LinkedIn

- [How to open Stripe in Serbia](https://www.linkedin.com/pulse/how-open-verified-stripe-account-serbia-mazino-oyolo-v8hxf) — US LLC guide
- [Stripe account Serbia guide](https://www.linkedin.com/pulse/open-stripe-account-serbia-easy-guide-olusola-david-w8zyf)

### Other

- [Doola: Stripe in Serbia](https://www.doola.com/stripe-guide/how-to-open-a-stripe-account-in-serbia/)
- [OneSafe: Does Stripe work in Serbia?](https://www.onesafe.io/blog/does-stripe-work-in-serbia)
- [Payoneer in Serbia (official)](https://blog.payoneer.com/home-page/how-to-use-payoneer-in-serbia/)
- [WTS Serbia: Payoneer guide](https://www.wtsserbia.com/blog/payoneer-u-srbiji/)

### Official Platform Status

- [Stripe Global](https://stripe.com/global) — Serbia NOT listed
- [Lemon Squeezy countries](https://docs.lemonsqueezy.com/help/getting-started/supported-countries) — Serbia listed
- [Paddle countries](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle) — Serbia supported
- [Dodo Payments countries](https://docs.dodopayments.com/miscellaneous/list-of-countries-we-accept-payments-from) — Serbia listed
- [Creem countries](https://docs.creem.io/merchant-of-record/supported-countries) — Serbia listed

---

## 9. Recommended Strategy for Clip2Fit

### Phase 1 (Launch)

- Use **Apple IAP + Google Play Billing + RevenueCat**
- Receive payments to personal Serbian bank account
- Pay taxes quarterly via **frilenseri.purs.gov.rs** (Model A)
- No business registration needed
- Cost: ~16% of revenue

### Phase 2 (Growth — 50K+ EUR/year)

- Register as **pausalac** for lower effective tax
- Open business bank account
- Consider adding web subscriptions via **Paddle** or **Lemon Squeezy**

### Phase 3 (Scale — 100K+ EUR/year)

- Register **DOO** (LLC)
- Apply **IP Box regime** (3% effective tax on software income)
- Full Stripe access via US LLC or EU subsidiary if needed for web payments

---

*Last updated: March 2026*
*Research covers: Apple/Google store policies, Serbian tax law, NBS foreign exchange rules, freelancer portal, community discussions*
