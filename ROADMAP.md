# Roadmap

## v0.1 — Local MVP ✓

- [x] Intesa Sanpaolo import
- [x] Generic CSV/Excel import
- [x] Category mapping system
- [x] Dashboard with monthly overview
- [x] Transaction list with filters
- [x] Charts (pie, bar, line)
- [x] Manual transaction entry
- [x] Budget tracking
- [x] PWA (offline, installable)
- [x] Data export (JSON)

---

## v0.2 — Polish & UX ✓

- [x] Transaction detail / edit page
- [x] Swipe to delete on transaction list with undo (5-second window)
- [x] Date range picker for charts (presets: month / 3m / 6m / year / custom)
- [x] Dark mode (system / light / dark, persisted, no FOUC)
- [x] Haptic feedback on mobile (Vibration API)
- [x] Better empty states with onboarding hero
- [x] Import progress indicator for large files (chunked with yieldToUI)
- [x] Recurring transaction detection (weekly / monthly / yearly, shown on dashboard)
- [x] Budget alerts at 80% and 100% (in-app toast + ProgressBar colour)
- [x] Category suggestions while typing (Dice similarity, local, no API)
- [x] Anomaly detection (median + MAD, per-category, ⚠ badge)

---

## v0.3 — Intelligence (partial)

- [x] **Recurring transaction detection** — surface monthly patterns ("Netflix €12.99 — monthly")
- [x] **Budget alerts** — toast when approaching / crossing limit
- [x] **Category suggestions during manual entry** — fuzzy match on description as you type
- [x] **Anomaly detection** — flag unusually large transactions per category
- [ ] **AI categorization** — send description to Claude API for zero-shot category suggestion (requires network + API key)

---

## v0.4 — Multi-bank & More Formats

- [ ] Fineco Bank parser
- [ ] UniCredit parser
- [ ] N26 CSV parser
- [ ] Revolut CSV parser
- [ ] OFX / QIF format support
- [ ] CAMT.053 XML (ISO 20022) support for institutional exports

---

## v0.5 — Sync (Convex)

- [ ] Implement `ITransactionRepository` etc. against Convex
- [ ] Multi-device real-time sync
- [ ] User authentication (Clerk)
- [ ] Per-device import history
- [ ] Conflict resolution strategy for offline edits

---

## v1.0 — Goals & Planning

- [ ] Savings goals (target amount + deadline)
- [ ] Year-over-year comparison charts
- [ ] PDF report generation
- [ ] Shared budgets (family / partner)
- [ ] CSV export (for spreadsheets)

---

## Technical Debt / Improvements

- [ ] Repository integration tests with `fake-indexeddb`
- [ ] React Testing Library tests for critical flows (import, add transaction)
- [ ] Storybook for shared components
- [ ] Performance: virtualized transaction list for large datasets (react-virtual)
- [ ] IndexedDB migration strategy for schema changes
- [ ] Error boundary + crash reporting (Sentry)
