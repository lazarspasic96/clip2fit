# Tax Guide: Serbian App Store Developer (2025-2026)

**Audience:** Serbian resident individual developer earning App Store subscription revenue from Apple
**Location:** Kragujevac, Serbia
**Last Updated:** April 2026

> **DISCLAIMER:** This is a research summary, not legal or tax advice. Tax laws change frequently. Consult a Serbian tax advisor (poreski savetnik) before making decisions.

---

## Table of Contents

1. [How the Money Flows](#1-how-the-money-flows)
2. [US Tax: Zero Obligation](#2-us-tax-zero-obligation)
3. [Serbian Tax: Three Structure Options](#3-serbian-tax-three-structure-options)
4. [Option A: Freelancer Regime (Frilenseri)](#4-option-a-freelancer-regime-frilenseri)
5. [Option B: Pausalac (Flat-Rate Entrepreneur)](#5-option-b-pausalac-flat-rate-entrepreneur)
6. [Option C: DOO (LLC)](#6-option-c-doo-llc)
7. [Social Contributions](#7-social-contributions)
8. [Annual Personal Income Tax (Godisnji Porez)](#8-annual-personal-income-tax-godisnji-porez)
9. [Apple-Specific Considerations](#9-apple-specific-considerations)
10. [VAT Obligations](#10-vat-obligations)
11. [Key Deadlines for 2026](#11-key-deadlines-for-2026)
12. [Common Mistakes](#12-common-mistakes)
13. [Comparison Tables](#13-comparison-tables)
14. [Recommended Path](#14-recommended-path)
15. [Sources](#15-sources)

---

## 1. How the Money Flows

```
Customer pays $7.99/week (or $34.99/year)
        ↓
Apple collects end-consumer VAT/sales tax (varies by country)
        ↓
Apple takes 15% commission (Small Business Program, <$1M/year)
        ↓
You receive 85% as "proceeds" (~$6.79/week)
        ↓
Apple withholds 0% US tax (app sales are NOT US-source income)
        ↓
Apple pays you via bank transfer within 45 days of fiscal month end
        ↓
You report and pay Serbian taxes on the proceeds received
```

**Key point:** You are taxed only in Serbia, only on what Apple actually pays you (after their commission), and only once you start receiving income.

---

## 2. US Tax: Zero Obligation

### No US-Serbia Tax Treaty Exists

Confirmed by:
- [IRS A-to-Z treaty list](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z) — neither Yugoslavia nor Serbia appears
- [KPMG Serbia treaty network](https://kpmg.com/rs/en/insights/tax-alerts/2024/03/double-taxation-treaties.html) — US not among Serbia's 65+ treaties
- Negotiations reported as ongoing but no treaty signed as of April 2026

### Why It Doesn't Matter

**App Store sales by non-US developers are NOT subject to US tax withholding or reporting.** Apple treats these payments as a sales/commission arrangement, not royalties. The income is not US-sourced.

This means:
- Apple withholds **0%** from your proceeds — no treaty needed
- You have **no US tax filing obligation**
- You pay tax **only in Serbia**

### W-8BEN Form

The W-8BEN form you submit to Apple simply **certifies you are not a US person**. It does not claim treaty benefits (there are none to claim).

**How to fill it:**
- **Part I:** Your name, country (Serbia), address, date of birth
- **Part II:** Leave ENTIRELY BLANK — no treaty exists
- **Part III:** Check both certification checkboxes, submit

The W-8BEN must be renewed every 3 years or when your information changes.

---

## 3. Serbian Tax: Three Structure Options

| Option | Best For | Approx. Effective Rate | Bookkeeping |
|--------|----------|----------------------|-------------|
| **Freelancer (Frilenseri)** | Starting out, low/variable income | 0% (low income) to ~26% | None |
| **Pausalac (Flat-Rate)** | Steady income under ~EUR 51K/yr | Fixed ~EUR 250-325/mo | None |
| **DOO (LLC)** | Income above ~EUR 80K/yr | ~27.75% | Full double-entry |

---

## 4. Option A: Freelancer Regime (Frilenseri)

### Who Qualifies

You qualify if you are:
- A natural person (not registered as entrepreneur or company)
- Earning income from **foreign** legal/natural persons (Apple = US entity)
- Income classified as copyright/related rights or agreed-upon service fees
- A Serbian tax resident

App Store subscription revenue from Apple fits this regime — software licensing constitutes copyright and related rights income.

**No APR registration required.** This is purely a tax reporting mechanism for natural persons.

### How to Register

1. Go to [frilenseri.purs.gov.rs](https://frilenseri.purs.gov.rs/en.html)
2. Register using your Serbian eID (elektronski identitet) or create an account
3. The portal is integrated with the ePorezi (e-Taxes) system
4. Submit quarterly tax returns via the portal
5. The system generates a payment slip with QR code after submission

### Model A vs Model B

Freelancers choose between two self-taxation models each quarter. You can switch every quarter.

#### MODEL A — Better for Lower Incomes

**Tax rate:** 20%
**Standardized quarterly expense deduction:** RSD 107,738 (~EUR 920)

```
Taxable Base = Quarterly Gross Income - RSD 107,738
Income Tax   = Taxable Base x 20%
PIO (pension) = Taxable Base x 24%
Health        = Taxable Base x 10.3% (minimum RSD 4,789/quarter)
```

**Key feature:** If quarterly income is below RSD 107,738 (~EUR 920), you pay ZERO tax and ZERO PIO. Only the minimum health insurance of RSD 4,789/quarter (~EUR 41) applies if you have no other health coverage.

**Example — quarterly income RSD 150,000 (~EUR 1,280):**

| Component | Calculation | Amount |
|-----------|------------|--------|
| Taxable base | 150,000 - 107,738 | RSD 42,262 |
| Income tax (20%) | 42,262 x 0.20 | RSD 8,452 |
| PIO (24%) | 42,262 x 0.24 | RSD 10,143 |
| Health (10.3%) | minimum applies | RSD 4,789 |
| **Total** | | **RSD 23,384 (~EUR 200)** |

#### MODEL B — Better for Higher Incomes

**Tax rate:** 10%
**Standardized quarterly expense deduction:** RSD 64,979 (fixed) + 34% of quarterly gross income

```
Standardized Expenses = RSD 64,979 + (Quarterly Gross Income x 34%)
Taxable Base          = Quarterly Gross Income - Standardized Expenses
Income Tax            = Taxable Base x 10%
PIO (pension)         = Taxable Base x 24% (minimum RSD 25,218/quarter)
Health                = Taxable Base x 10.3% (minimum RSD 4,789/quarter)
```

**Key feature:** Model B has a MANDATORY MINIMUM PIO contribution of RSD 25,218/quarter (~EUR 215/quarter, ~EUR 860/year) even if income is zero or very low.

**Example — quarterly income RSD 1,000,000 (~EUR 8,530):**

| Component | Calculation | Amount |
|-----------|------------|--------|
| Standardized expenses | 64,979 + (1,000,000 x 0.34) | RSD 404,979 |
| Taxable base | 1,000,000 - 404,979 | RSD 595,021 |
| Income tax (10%) | 595,021 x 0.10 | RSD 59,502 |
| PIO (24%) | 595,021 x 0.24 | RSD 142,805 |
| Health (10.3%) | 595,021 x 0.103 | RSD 61,287 |
| **Total** | | **RSD 263,594 (~26.4% effective)** |

#### When to Use Which Model

| Quarterly Income | Better Model | Why |
|-----------------|-------------|-----|
| Under RSD 107,738 (~EUR 920) | **Model A** | Zero tax, zero PIO |
| RSD 107,738 - ~RSD 400,000 | **Model A** | Lower total burden |
| Above ~RSD 400,000 (~EUR 3,400) | **Model B** | 10% rate + 34% deduction saves more |

Use the [official calculator](https://frilenseri.purs.gov.rs/en/tax-calculator.html) to check your exact situation each quarter.

### Quarterly Filing

**Form:** PP OPO-K (submitted electronically via frilenseri portal or ePorezi)

| Quarter | Period | Deadline |
|---------|--------|----------|
| Q1 | Jan 1 - Mar 31 | April 30 |
| Q2 | Apr 1 - Jun 30 | July 30 |
| Q3 | Jul 1 - Sep 30 | October 30 |
| Q4 | Oct 1 - Dec 31 | January 30 (next year) |

### Zero Income Quarters

- **Model A:** No filing obligation. Zero income = zero tax.
- **Model B:** Minimum PIO (RSD 25,218/quarter) still applies.

### Penalties

- Fines: RSD 5,000 to RSD 150,000 for non-filing or non-payment
- Interest accrues from the day after the deadline
- If you fail to file, the Tax Administration files on your behalf using available data (often unfavorable)

---

## 5. Option B: Pausalac (Flat-Rate Entrepreneur)

### How It Works

A pausalac (pausalni preduzetnik) is a registered sole proprietor who pays a **fixed monthly amount** regardless of actual income. The Tax Administration determines your monthly obligation based on your activity code, municipality, and national average salary.

### NACE/Activity Codes for App Developers

| Code | Activity | Eligible? |
|------|----------|-----------|
| **62.01** | Computer programming | Yes |
| 62.02 | Computer consultancy | Yes |
| 62.09 | Other IT and computer services | Yes |

Most app developers register under **62.01**.

### Monthly Fixed Amount

```
Lump-Sum Tax Base = Average Municipal Salary x Activity Coefficient
Income Tax        = Tax Base x 10%
PIO               = Tax Base x 24%
Health             = Tax Base x 10.3%
Unemployment       = Tax Base x 0.75%
Total Rate on Base = 45.05%
```

**Typical monthly amounts for IT (62.01) in 2025-2026:**

| Location | Monthly Amount |
|----------|---------------|
| Belgrade | ~RSD 35,000-45,000 (~EUR 300-385) |
| **Kragujevac** | **~RSD 28,000-38,000 (~EUR 240-325)** |
| Smaller cities | ~RSD 25,000-35,000 (~EUR 215-300) |

The **10% annual growth cap** on the tax base has been extended through 2027 — your obligation cannot increase by more than 10% year over year.

### Revenue Cap

- **RSD 6,000,000/year (~EUR 51,000):** Maximum to maintain pausalac status
- **RSD 8,000,000/year (~EUR 68,000):** If exceeded, you lose pausalac status AND must register for VAT

### Registration Process

1. Choose your NACE code (62.01 for programming)
2. Register with [APR](https://apr.gov.rs/) via e-Registration with eID
3. Select "one-stop-shop" for simultaneous Tax Admin + Statistical Office + Social Security registration
4. Registration fee: ~RSD 3,500 (~EUR 30)
5. Select lump-sum taxation during registration
6. Open a business bank account (dinarski racun) at any Serbian bank
7. Receive your tax decision on ePorezi within ~48 hours
8. Pay monthly by the 15th of the following month

### Pros vs Cons (Compared to Freelancer)

| | Pros | Cons |
|---|---|---|
| Cost | Fixed, predictable | Pay even in zero-income months |
| Simplicity | Just pay monthly | Must register with APR |
| Efficiency | Extremely low effective rate at higher income | Revenue cap RSD 6M/yr |
| Coverage | Pension + health always covered | Cannot deduct real expenses |
| Liability | - | Personal unlimited liability |
| Growth | - | Forced into VAT if exceeding RSD 8M |

---

## 6. Option C: DOO (LLC)

### When It Makes Sense

- Revenue exceeds RSD 6-8M/year (above pausalac cap)
- You want limited liability protection
- You plan to hire employees
- You want to reinvest profits without immediate taxation
- Annual income exceeds ~EUR 80,000-100,000

### Tax Rates

```
Corporate Income Tax (CIT):     15% on net profit
Dividend Withholding Tax:       15% on distributed dividends
Effective combined rate:        ~27.75% (15% + 15% of remaining 85%)
```

If you retain profits (reinvest), you pay only the 15% CIT. Dividend tax applies only when you distribute.

### Requirements

- Full double-entry bookkeeping (mandatory)
- Monthly/quarterly VAT returns (if VAT registered)
- Annual financial statements submitted to APR
- Annual CIT return
- Accountant required — typical cost: EUR 100-300/month
- Transfer pricing rules apply if owner also provides services

---

## 7. Social Contributions

### Rates (2025-2026)

| Contribution | Rate | Notes |
|-------------|------|-------|
| Pension & Disability (PIO) | 24% | All self-employed income |
| Health Insurance | 10.3% | All self-employed income |
| Unemployment | 0.75% | Pausalac only (freelancers exempt) |
| **Total** | **34.3%** (freelancer) / **35.05%** (pausalac) | |

### Minimum Contribution Base (2026)

| Parameter | Amount |
|-----------|--------|
| Minimum monthly base | RSD 51,297 (~EUR 438) |
| Minimum monthly PIO (24%) | RSD 12,311 |
| Minimum monthly health (10.3%) | RSD 5,284 |
| Maximum annual contribution base | RSD 8,793,840 |

### Health Insurance Exemption

You do NOT pay health insurance contributions if already insured through:
- Employment (full-time job)
- Retirement/pension
- Spouse's insurance (as dependent)

If freelancing is your only activity, health insurance contributions are mandatory.

### Zero Income — Still Pay?

| Structure | Zero Income Obligation |
|-----------|----------------------|
| Freelancer Model A | No (except minimum health ~RSD 4,789/quarter if no other coverage) |
| Freelancer Model B | Yes — minimum PIO RSD 25,218/quarter |
| Pausalac | Yes — full fixed monthly amount |
| DOO | Yes — minimum salary contributions for director |

---

## 8. Annual Personal Income Tax (Godisnji Porez)

### What Is It?

An additional surtax on total annual income exceeding three times the average annual salary. This is **on top of** the quarterly taxes you already pay.

### 2025 Tax Year (filed May 15, 2026)

| Parameter | Amount |
|-----------|--------|
| Non-taxable threshold (3x avg annual salary) | RSD 5,439,096 (~EUR 46,500) |
| 10% bracket ceiling (6x avg annual salary) | RSD 10,878,192 (~EUR 93,000) |
| 10% rate | On income from RSD 5,439,096 to RSD 10,878,192 |
| 15% rate | On income above RSD 10,878,192 |

### Calculation

1. Sum ALL taxable income for the year (freelance, employment, self-employment, author fees)
2. Subtract taxes and social contributions already paid during the year
3. Subtract the non-taxable amount (RSD 5,439,096)
4. Apply personal deductions: RSD 725,213 (taxpayer) + RSD 271,955 per dependent
5. Personal deductions capped at 50% of taxable income
6. Apply 10%/15% progressive rates to the remainder

### Under-40 Bonus

If you are under 40 years old on December 31 of the tax year, you get an **additional deduction of RSD 5,439,096** on employment, self-employment, and author income. This effectively **doubles your non-taxable threshold** to ~RSD 10.9M (~EUR 93,000).

### Filing

- **Form:** PP-GPDG (electronic, via ePorezi portal)
- **Deadline:** May 15 of the following year

### Excluded Income

NOT included in the annual tax base:
- Capital gains (securities, crypto, property)
- Dividends and interest
- Gambling/lottery winnings
- Insurance proceeds

---

## 9. Apple-Specific Considerations

### How Apple Pays

| Detail | Value |
|--------|-------|
| Payment schedule | Within 45 days of fiscal month end |
| Fiscal calendar | 364-day calendar with 28 or 35-day months (NOT standard months) |
| Payment reports | Available by first Friday of current fiscal month |
| Transfer method | Electronic funds transfer (EFT) / bank transfer |
| Payment | One payment per currency per fiscal month |
| Minimum threshold | ~USD 150 (USD 10 for EUR, CAD, CHF, GBP) |
| Below threshold | Rolls over to next month |

### Small Business Program

If you earn less than $1M in proceeds per calendar year:
- Commission drops from **30% to 15%** on all paid apps, IAPs, and subscriptions
- Auto-renewing subscriptions after Year 1: 15% regardless of program enrollment

You will almost certainly qualify for this.

### Tax Base: Net Proceeds, Not Gross

**Tax is calculated on what Apple pays you (proceeds), not the customer price.**

Example:
- Customer pays $9.99/month subscription
- Apple takes 15% commission = $1.50
- Apple handles end-consumer VAT separately
- You receive ~$8.49 ("proceeds")
- Serbian tax calculated on this $8.49 equivalent in RSD

### Currency Conversion

- Apple pays in the currency you configure in App Store Connect
- Set up a **USD or EUR bank account** in Serbia to receive payments
- For tax purposes, convert to RSD using the **National Bank of Serbia (NBS) middle exchange rate** on the date of receipt
- Keep records of exchange rates used for each payment

### Documentation to Keep (5 years minimum)

1. Apple financial reports (download monthly from App Store Connect)
2. Bank statements showing Apple deposits
3. Exchange rate documentation (NBS rates on deposit dates)
4. W-8BEN form copy
5. App Store Connect tax documents and invoices
6. Quarterly tax returns (PP OPO-K forms)
7. Proof of Small Business Program enrollment

---

## 10. VAT Obligations

### Short Answer: Not initially.

### VAT Registration Threshold

- Domestic mandatory threshold: **RSD 8,000,000/year (~EUR 68,000)**
- Voluntary registration possible at any level

### Why VAT Doesn't Apply to Your Apple Income

Apple acts as **merchant of record** — Apple collects and remits end-consumer VAT on your behalf. Your transaction with Apple is a **B2B** relationship:

1. You supply digital content to Apple
2. Apple resells to consumers and handles their VAT
3. B2B export services to Apple (a US company) are **outside the scope of Serbian VAT** (place of supply = where Apple is established = US)

### By Structure

| Structure | VAT Status |
|-----------|-----------|
| Freelancer | Not in VAT system — VAT does not apply |
| Pausalac | Cannot be VAT registered (mutually exclusive). Lose pausalac if exceeding RSD 8M |
| DOO (VAT registered) | Invoices to Apple at 0% VAT (export of services); can reclaim input VAT on expenses |

---

## 11. Key Deadlines for 2026

### Freelancer Quarterly

| Deadline | What |
|----------|------|
| January 30, 2026 | File + pay Q4 2025 |
| April 30, 2026 | File + pay Q1 2026 |
| July 30, 2026 | File + pay Q2 2026 |
| October 30, 2026 | File + pay Q3 2026 |
| January 30, 2027 | File + pay Q4 2026 |

### Pausalac Monthly

- **15th of each month** for the previous month

### Annual Income Tax

| Deadline | What |
|----------|------|
| May 15, 2026 | PP-GPDG for 2025 income |
| May 15, 2027 | PP-GPDG for 2026 income |

### Other

| Date | What |
|------|------|
| January 2026 | 2026 pausalac tax decisions published on ePorezi |
| Every 3 years | W-8BEN renewal with Apple |

---

## 12. Common Mistakes

### 1. Not Reporting Foreign Income
Many developers assume Apple income from abroad doesn't need reporting. **All worldwide income must be reported by Serbian tax residents.**

### 2. Choosing the Wrong Model Each Quarter
Not recalculating which freelancer model (A vs B) is optimal. Use the [calculator](https://frilenseri.purs.gov.rs/en/tax-calculator.html) before each filing.

### 3. Forgetting the Annual Income Tax (Godisnji Porez)
Quarterly taxes don't eliminate the annual surtax if total income exceeds ~EUR 46,500 net (or ~EUR 93,000 if under 40).

### 4. Not Keeping Exchange Rate Records
Apple pays in USD/EUR. You must document the NBS middle exchange rate on each transaction date.

### 5. Missing Quarterly Deadlines
Late filing incurs interest from day after deadline. The Tax Administration may file on your behalf with unfavorable assumptions.

### 6. Calculating Tax on Gross Instead of Net
Your taxable income is what Apple **pays you** (after commission), not what the customer pays.

### 7. Ignoring Model B Minimum PIO
Choosing Model B in a low-income quarter and being surprised by the mandatory RSD 25,218/quarter minimum.

### 8. Exceeding Pausalac Thresholds Without Planning
Crossing RSD 6M (lose pausalac) or RSD 8M (forced VAT) without preparing the transition.

### 9. Not Using the Under-40 Deduction
If you're under 40, the annual income tax threshold effectively doubles. Don't miss this.

### 10. Filling W-8BEN Part II
There is no US-Serbia tax treaty. Part II must be left blank.

---

## 13. Comparison Tables

### Starting Out (EUR 0-500/month from Apple)

| | Freelancer Model A | Freelancer Model B | Pausalac |
|---|---|---|---|
| Monthly cost (EUR 0) | EUR 0 (+ ~EUR 14 health) | ~EUR 86 min PIO + health | ~EUR 250-325 fixed |
| Monthly cost (EUR 500) | ~EUR 80 | ~EUR 100 | ~EUR 250-325 fixed |
| Bookkeeping | None | None | None |
| Registration | Frilenseri portal | Frilenseri portal | APR + bank account |
| **Verdict** | **Best** | Avoid | Avoid |

### Growing (EUR 1,000-3,000/month from Apple)

| | Freelancer Model B | Pausalac |
|---|---|---|
| Monthly cost (EUR 2,000) | ~EUR 500 (~25%) | ~EUR 250-325 fixed (~13-16%) |
| Flexibility | Scales with income | Fixed regardless |
| **Verdict** | Good if variable | **Best if steady** |

### Scaling (EUR 3,000-5,000/month from Apple)

| | Pausalac | DOO |
|---|---|---|
| Monthly cost (EUR 4,000) | ~EUR 250-325 fixed (**~6-8%!**) | ~EUR 1,000+ (CIT + accountant) |
| Cap | RSD 6M/yr | No cap |
| **Verdict** | **Optimal** until cap | Start planning transition |

### High Growth (EUR 5,000+/month from Apple)

| | Pausalac | DOO |
|---|---|---|
| Feasible? | Only if under EUR 51K/yr | Yes |
| Effective rate | ~5-6% | ~27.75% (but can defer via retained earnings) |
| **Verdict** | Maximize while under cap | **Required** above cap |

---

## 14. Recommended Path

### Phase 1: Starting Out (now)
**Use Freelancer Model A.** Zero cost when you have no income. File quarters with zero income as needed (or don't — Model A has no obligation at zero). Start filing once Apple payments arrive.

### Phase 2: Growing (steady EUR 2,000-3,000/month)
**Transition to Pausalac.** Register with APR under NACE 62.01. Fixed monthly ~EUR 250-325 in Kragujevac regardless of actual income. Dramatically lower effective tax rate.

### Phase 3: Scaling (approaching EUR 51K/year)
**Plan DOO transition before hitting the cap.** Consult a Serbian accountant to set up the DOO, transfer the App Store relationship, and begin proper bookkeeping.

### When to Consult an Accountant
- Before registering as pausalac (to confirm optimal structure)
- When annual income approaches RSD 4-5M (planning for limits)
- When considering DOO formation
- For annual income tax filing if income is significant

---

## 15. Sources

### Official Government
- [Frilenseri Portal (Tax Administration)](https://frilenseri.purs.gov.rs/en.html)
- [Two Self-Taxation Options Explained](https://frilenseri.purs.gov.rs/en/useful-information/two-self-taxation-options.html)
- [Frilenseri Tax Calculator](https://frilenseri.purs.gov.rs/en/tax-calculator.html)
- [APR e-Registration](https://apr.gov.rs/services/eservices/e-incorporation-of-sole-proprietors.4266.html)
- [Serbia International Tax Agreements](https://www.srbija.gov.rs/tekst/en/130087/international-tax-agreements.php)
- [Welcome to Serbia — Income Taxes](https://welcometoserbia.gov.rs/income-taxes)

### Law Firms and Tax Advisory
- [Zunic Law — Freelancer Taxes in Serbia](https://zuniclaw.com/en/serbia-freelancer-tax/)
- [Zunic Law — Lump-Sum Tax Reform](https://zuniclaw.com/en/law-on-personal-income-tax/)
- [PM Advokati — Lump-Sum Taxation Guide](https://pmadvokati.com/en/lump-sum-taxation-in-serbia-guide-for-entrepreneurs/)
- [Tax Advisor Serbia — Annual PIT Guide](https://www.taxadvisorserbia.com/insights/annual-personal-income-tax-serbia-expats-guide)

### Accounting and Consulting
- [Creative Finance — Flat-Rate Decisions 2026](https://creativefinance.rs/en/flat-rate-entrepreneurs-receive-new-tax-decisions-for-2026/)
- [Creative Finance — Annual PIT 2025](https://creativefinance.rs/en/annual-personal-income-tax-in-serbia-key-information-for-2025/)
- [Experta — 2026 Contribution Bases](https://experta.rs/en/minimum-and-maximum-contribution-bases-as-of-january-1-2026-and-their-impact-on-contribution-calculations/)
- [KPMG Serbia — 2025 PIT Amendments](https://kpmg.com/rs/en/insights/tax-alerts/2025/12/amendments-to-personal-income-tax-and-social-security-contributions-adopted.html)

### International Tax
- [PwC — Serbia Individual Taxes](https://taxsummaries.pwc.com/serbia/individual/taxes-on-personal-income)
- [PwC — Serbia Corporate Taxes](https://taxsummaries.pwc.com/serbia/corporate/taxes-on-corporate-income)
- [IRS — US Income Tax Treaties A-to-Z](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z)
- [KPMG — Serbia Double Taxation Treaties](https://kpmg.com/rs/en/insights/tax-alerts/2024/03/double-taxation-treaties.html)

### Apple Developer
- [Apple — Overview of Receiving Payments](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments/)
- [Apple — Commissions, Fees, and Taxes](https://developer.apple.com/help/app-store-connect/making-payments-to-apple/understanding-taxes/)
- [Apple — Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- [Apple — Provide Tax Information](https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information/)

### VAT
- [Fonoa — Serbia VAT Guide](https://www.fonoa.com/resources/country-tax-guides/serbia)
- [Fonoa — VAT on Digital Services Serbia](https://www.fonoa.com/resources/country-tax-guides/serbia/tax-on-digital-services)
- [Anrok — Serbia VAT for Digital Businesses](https://www.anrok.com/vat-software-digital-services/serbia)
