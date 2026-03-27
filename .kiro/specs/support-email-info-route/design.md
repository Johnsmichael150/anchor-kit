# Design Document: support_email in /info Route

## Overview

The `/info` endpoint in `AnchorExpressRouter` already conditionally includes `interactive_domain` when `server.interactiveDomain` is set. This change applies the same pattern to `support_email`, reading from `operational.supportEmail` which already exists in `OperationalConfig`.

No new config fields, no new dependencies, and no schema changes are needed — the field is already modelled. The only change is in the `/info` handler in `express-router.ts` and the corresponding tests.

## Architecture

The change is entirely within the HTTP layer. The config layer (`AnchorConfig`) already surfaces `operational.supportEmail` via `getConfig()`. The router reads the full config once and conditionally appends the field to the response body.

```
GET /info
  └─ AnchorExpressRouter.handle()
       └─ config.getConfig().operational?.supportEmail
            ├─ defined  → include support_email in response body
            └─ undefined → omit support_email from response body
```

## Components and Interfaces

### AnchorExpressRouter (`src/runtime/http/express-router.ts`)

The `/info` handler currently builds `responseBody` and conditionally adds `interactive_domain`:

```typescript
if (fullConfig.server.interactiveDomain) {
  responseBody.interactive_domain = fullConfig.server.interactiveDomain;
}
```

The change adds an analogous block immediately after:

```typescript
if (fullConfig.operational?.supportEmail) {
  responseBody.support_email = fullConfig.operational.supportEmail;
}
```

No other components require modification.

## Data Models

The `OperationalConfig` interface in `src/types/config.ts` already declares:

```typescript
export interface OperationalConfig {
  // ...
  /** Support contact email @optional */
  supportEmail?: string;
  // ...
}
```

The `/info` response is an ad-hoc `Record<string, unknown>` — no formal response type exists. The new field follows the existing snake_case naming convention used by all other response fields (`interactive_domain`, `asset_code`, etc.).

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: support_email present when configured
*For any* anchor configuration that includes a non-empty `operational.supportEmail` value, the `/info` response body SHALL contain a `support_email` field equal to that configured value.
**Validates: Requirements 1.1**

Property 2: support_email absent when not configured
*For any* anchor configuration that omits `operational.supportEmail` (or sets it to `undefined`), the `/info` response body SHALL NOT contain a `support_email` field.
**Validates: Requirements 1.2**

Property 3: /info always returns 200
*For any* valid anchor configuration (with or without `operational.supportEmail`), a `GET /info` request SHALL return HTTP status 200.
**Validates: Requirements 1.3**

## Error Handling

No new error conditions are introduced. The field is read-only and optional; if `operational` itself is `undefined` the optional-chaining access `fullConfig.operational?.supportEmail` safely returns `undefined` and the field is omitted.

## Testing Strategy

**Dual Testing Approach**

Unit / integration tests (in `tests/mvp-express.integration.test.ts`) cover the specific examples and edge cases:

- Example: `/info` includes `support_email` when `operational.supportEmail` is configured (Property 1).
- Example: `/info` omits `support_email` when `operational.supportEmail` is not configured (Property 2).
- Example: `/info` returns 200 in both cases (Property 3).

These are example-based tests rather than property-based tests because the behaviour is a simple conditional on a single string field. The input space is small (configured vs. not configured), and exhaustive example coverage is sufficient. A property-based test would add no meaningful additional coverage here.

**Property-Based Testing**

Not applicable for this feature. The correctness properties reduce to two mutually exclusive examples (field present vs. field absent), which are fully covered by the integration tests above. A PBT library would generate random email strings, but the router does not validate or transform the email value — it passes it through verbatim — so random generation adds no value.

**Test placement**: add two focused `it` blocks to the existing `describe('MVP Express-mounted integration')` suite in `tests/mvp-express.integration.test.ts`, following the pattern of the existing `2b) /info omits interactive_domain when not configured` test.
