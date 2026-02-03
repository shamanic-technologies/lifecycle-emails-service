# Project Rules

## Mandatory: Tests for Every Bug Fix / Issue

When working on any bug fix or issue:

1. **Write a regression test first** — before fixing the code, create a test in `tests/` that reproduces the bug and fails.
2. **Then fix the code** — make the test pass.
3. **Test file naming** — use `tests/<module>.test.ts` matching the source file (e.g., `src/routes/send.ts` → `tests/routes/send.test.ts`).
4. **CI must pass** — all tests run in GitHub Actions on every push and PR. Never merge without green CI.

This ensures every past bug is permanently guarded against regression.

## Test Stack

- **Framework:** Vitest (`npm run test`)
- **HTTP testing:** Supertest
- **Run unit only:** `npm run test:unit`
- **Run integration only:** `npm run test:integration`
