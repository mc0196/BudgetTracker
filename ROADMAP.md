# Roadmap

## v0.1 — Current (Local MVP)

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

## v0.2 — Polish & UX

- [ ] Transaction detail / edit page
- [ ] Swipe to delete on transaction list
- [ ] Date range picker for charts
- [ ] Dark mode
- [ ] Haptic feedback on mobile (Vibration API)
- [ ] Better empty states with onboarding hints
- [ ] Import progress indicator for large files
- [ ] Undo for deletes (IndexedDB transaction rollback)

---

## v0.3 — Intelligence

- [ ] **Recurring transaction detection** — surface monthly patterns ("Netflix €12.99 — monthly")
- [ ] **AI categorization** — send description to Claude API for zero-shot category suggestion
- [ ] **Budget alerts** — push notification when approaching limit (Web Push API)
- [ ] **Category suggestions during manual entry** — based on description as you type
- [ ] **Anomaly detection** — flag unusually large transactions

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
