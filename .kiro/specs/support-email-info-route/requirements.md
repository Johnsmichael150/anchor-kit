# Requirements Document

## Introduction

Add a `support_email` field to the `/info` route response when `operational.supportEmail` is configured in the anchor's config. The field must be omitted entirely from the response when no support email is configured. This mirrors the existing pattern used for `interactive_domain`.

## Glossary

- **Router**: The `AnchorExpressRouter` class in `src/runtime/http/express-router.ts` that handles all HTTP routes including `/info`.
- **AnchorConfig**: The `AnchorConfig` class in `src/core/config.ts` that manages the anchor's configuration.
- **OperationalConfig**: The `operational` section of `AnchorKitConfig`, which already contains the optional `supportEmail` field.
- **Info_Response**: The JSON object returned by the `GET /info` endpoint.

## Requirements

### Requirement 1: Expose support email in /info response

**User Story:** As a client consuming the anchor API, I want to see the anchor's support email in the `/info` response, so that I can direct users to the correct support contact.

#### Acceptance Criteria

1. WHEN a `GET /info` request is received AND `operational.supportEmail` is configured, THE Router SHALL include a `support_email` field in the Info_Response containing the configured email value.
2. WHEN a `GET /info` request is received AND `operational.supportEmail` is not configured, THE Router SHALL omit the `support_email` field from the Info_Response entirely.
3. THE Router SHALL return a 200 status code for all valid `GET /info` requests regardless of whether `support_email` is present.
