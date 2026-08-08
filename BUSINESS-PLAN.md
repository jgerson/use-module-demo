# Provenant — business concept

**One line:** Discover every AI system employees have connected to company data, then turn
that register into the evidence enterprise buyers now demand before they sign.

---

## 1. The problem

Three forces landed on top of each other in 2026:

| Force | Evidence |
|---|---|
| **Employees adopted AI faster than IT could track it** | 45–66% of the workforce uses unsanctioned AI tools. The average company runs ~14 AI tools; IT can name 4–5. |
| **Enterprise procurement started auditing it** | Effectively every serious vendor security questionnaire in H2 2026 carries an AI governance block (AI-CAIQ v1.0.2, SIG 2025). Policy PDFs fail; buyers want management-system artifacts. |
| **Regulation began to bite selectively** | EU AI Act Article 50 transparency duties became binding 2 Aug 2026 and were *not* included in the delay that pushed high-risk obligations to Dec 2027. Penalties up to €15M / 3% of turnover. ISO/IEC 42001 is becoming a procurement qualification, not a differentiator. |

**The buying trigger is revenue, not ethics.** A mid-market vendor gets a 60-question AI
security questionnaire from a Fortune 1000 prospect, spends ~3 weeks hand-answering it, and
loses to a competitor with a one-line answer. That is the pain that opens budget — the same
mechanic that built Vanta.

**Why it's unsolved:** every existing answer starts from a self-attested inventory — someone
types their AI tools into a form. That inventory is wrong on day one, because the company
doesn't know what it's running. Nobody grounds the register in observed evidence.

---

## 2. The product

Four stages, in dependency order:

1. **Discover** — read-only OAuth into Google Workspace / Entra ID / Okta enumerates every
   third-party AI service holding a live grant, with scopes and user counts. Reconciled
   against card/AP spend. Agentless, ~10 minutes to first register.
2. **Classify** — infer exposed data classes from granted scopes; assign provider-vs-deployer
   role under the EU AI Act; flag Article 50 applicability, sub-processors, training-on-your-data.
3. **Govern** — request→review→approve workflow, named owners, review cadence, AI use policy
   and employee attestation, mapped to ISO/IEC 42001 and NIST AI RMF.
4. **Prove** — *the monetizing stage.* Trust Pack evidence bundle, AI-CAIQ / SIG AI module
   autofill with citations back to register records, public AI trust page, auditor read-only access.

**Wedge:** discovery is free forever and self-serve. You pay when the register has to hold up
in front of someone else.

**Moat:** the grant/scope→data-class→control mapping corpus, built from every scan. It compounds
and is exactly what a self-attestation competitor cannot copy from a spec.

---

## 3. Capital required

Two viable paths. I'd recommend **B** given the deadline-driven window.

### Path A — bootstrapped: **$220K**, 12 months, 2 founders

Founders on minimal draw, no hires, design partners → paid by month 7. Gets you to roughly
$250–400K ARR and either default-alive or a strong seed story.

### Path B — pre-seed: **$1.75M**, 18-month runway (recommended)

| Line | 18-mo cost |
|---|---:|
| 2 founders @ $120K | $360K |
| 2 engineers @ $170K (from mo. 3) | $425K |
| Founding AE @ $140K base (from mo. 9) | $105K |
| Design / PMM contractors | $60K |
| Payroll tax + benefits (~20%) | $180K |
| Infrastructure + LLM inference | $60K |
| **Our own** SOC 2 + ISO 42001 (non-negotiable — we must dogfood) | $45K |
| Legal, entity, IP, DPAs | $40K |
| Sales tooling, data, marketing | $90K |
| Buffer (~10%) | $160K |
| **Total** | **~$1.75M** |

Milestone this buys: ~$2M ARR and a repeatable sales motion — a Series A story.

---

## 4. Revenue

**Pricing** (published, annual, no seat counting):

| Tier | Price | Buyer |
|---|---:|---|
| Register (≤250 staff) | $6,000/yr | Knows they have a blind spot |
| Govern | $18,000/yr | Standing up a management system pre-audit |
| Prove | $36,000/yr | Deals stuck in procurement right now |
| Enterprise | $60–120K/yr | Regulated, multi-entity |

Benchmark: Vanta lands $10–80K/yr, Drata from ~$7.5K; mid-market compliance ACVs cluster
$20–55K. Our pricing sits deliberately just under, as an add-on rather than a replacement.

**Projection** (blended ACV rises with tier mix and expansion):

| | End Y1 | End Y2 | End Y3 |
|---|---:|---:|---:|
| Customers | 25 | 95 | 260 |
| Blended ACV | $18K | $23K | $27K |
| **ARR — base case** | **$450K** | **$2.2M** | **$7.0M** |
| ARR — bear | $250K | $900K | $2.5M |
| ARR — bull | $700K | $3.8M | $14M |

**Unit economics (target, steady state):** 82% gross margin (LLM inference is the drag) ·
CAC ~$14K · payback ~10 months · logo churn 12% · NRR 115% · LTV/CAC ≈ 3.5–4×.

Base case is calibrated against Vanta's 0→~$10M ARR in ~2 years on an equivalent
deal-gating forcing function, discounted for a smaller wedge.

---

## 5. Risks — honestly

| Risk | Severity | Mitigation |
|---|---|---|
| **Vanta/Drata ship an AI module and bundle it** | Highest | Their inventories are self-attested. Own *discovery* and evidence quality; be the data source they'd rather integrate than rebuild. Plan for an integration/acquisition path. |
| High-risk AI Act delay to Dec 2027 kills urgency | Medium | Sell the procurement forcing function, which is live now and independent of regulators. Article 50 is already binding. |
| OAuth discovery misses browser-only tools | Medium | Optional browser signal + network log ingest as a second source. |
| "AI governance" reads as a checkbox | Medium | Never sell governance. Sell deal velocity, priced against deals unblocked. |
| Buyer confusion with security-questionnaire-AI vendors | Low | We supply the *truth* the answers cite, not just faster prose. |

**Conflict-of-interest flag:** this concept deliberately avoids cloud-cost/FinOps, which is
Vantage's space, so the domain overlap is low. Still worth reading your employment agreement
on IP assignment and outside activity before doing anything material.

---

## 6. First 90 days

1. **Weeks 1–3** — 25 discovery calls with security/GTM leads at 100–2,000-person B2B SaaS
   companies. One question: *show me the last AI questionnaire you answered.* Kill the idea
   if fewer than half have one.
2. **Weeks 4–8** — Build discovery only, Google Workspace first. No governance, no UI polish.
3. **Weeks 9–12** — Run free scans for 8 design partners. The register itself is the demo;
   the "you have 14, you knew about 4" moment is the entire sales pitch. Convert on the
   Trust Pack.

The riskiest assumption is not technical — it's whether the questionnaire pain is acute enough
to open budget *this quarter*. Step 1 answers that for the price of three weeks.
