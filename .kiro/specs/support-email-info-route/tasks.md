# Implementation Plan: support_email in /info Route

## Overview

Two focused changes: add the conditional `support_email` field to the `/info` handler, then add integration tests that verify the field is present when configured and absent when not.

## Tasks

- [x] 1. Add support_email to the /info response in AnchorExpressRouter
  - In `src/runtime/http/express-router.ts`, inside the `GET /info` handler, add a conditional block after the existing `interactive_domain` block:
    ```typescript
    if (fullConfig.operational?.supportEmail) {
      responseBody.support_email = fullConfig.operational.supportEmail;
    }
    ```
  - No other files need to change — `OperationalConfig.supportEmail` already exists in `src/types/config.ts`.
  - _Requirements: 1.1, 1.2_
  - Note: The block was added but is duplicated — remove the duplicate occurrence.

- [x] 2. Fix duplicate support_email block in express-router.ts
  - Remove the second (duplicate) `if (fullConfig.operational?.supportEmail)` block in the `/info` handler in `src/runtime/http/express-router.ts`.
  - _Requirements: 1.1_

- [ ]* 3. Write integration test: support_email present when configured
  - Add an `it` block to `tests/mvp-express.integration.test.ts` that creates an anchor with `operational: { supportEmail: 'support@example.com' }`, calls `/info`, and asserts `response.body.support_email === 'support@example.com'` and `response.status === 200`.
  - Follow the pattern of the existing `2b) /info omits interactive_domain when not configured` test (spin up a dedicated anchor instance, call `/info`, assert, then shut down and clean up the db).
  - **Property 1: support_email present when configured**
  - **Validates: Requirements 1.1, 1.3**

- [ ]* 4. Write integration test: support_email absent when not configured
  - Add an `it` block to `tests/mvp-express.integration.test.ts` that creates an anchor without `operational.supportEmail`, calls `/info`, and asserts `response.body` does not have property `support_email` and `response.status === 200`.
  - Note: the existing `2b)` test already covers this case — verify it asserts `not.toHaveProperty('support_email')` and add the assertion if missing rather than creating a duplicate anchor instance.
  - **Property 2: support_email absent when not configured**
  - **Validates: Requirements 1.2, 1.3**

- [x] 5. Checkpoint — run the test suite
  - Run `bun test` and ensure all existing tests still pass alongside the two new tests.
  - Ensure all tests pass, ask the user if questions arise.
