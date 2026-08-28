# Production Optimization Report

## Architecture

Node.js/Express 5 serves the API from `index.js`. MongoDB is accessed through Mongoose models. Redis stores hashed refresh-token sessions when `REDIS_URL` is configured. Nodemailer sends OTP mail, Google Auth Library verifies Google ID tokens, and Razorpay creates/verifies payment orders. The React client calls the routes listed in `docs/API.md`.

## Findings

- Public collection queries were unbounded and returned no pagination metadata.
- Auth, registration, and payment requests had insufficient route-specific throttling.
- Auth catch blocks exposed internal error messages to clients.
- OTP generation used `Math.random()`.
- Registration seat reservation and related multi-document team/cancellation writes now run in MongoDB transactions; the configured Atlas replica set supports the required sessions.
- Duplicate user, registration, team code/name, and payment identifiers are protected by unique indexes where defined.
- Event, registration, announcement, and payment reads use lean/populated projections in the existing implementation.
- Redis refresh sessions are hashed, single-use rotated, and revocable. Redis is optional and health status is reported.
- Google login already degrades with `503` when not configured.
- Existing tests covered only auth/admin middleware; endpoint, validation, concurrency, payment, and external-service tests were missing.
- No cache was implemented: public data invalidation and cache consistency were not yet defined, so MongoDB remains the source of truth.

## Changes Implemented

- Added bounded pagination (`page`, `limit`, maximum 100) to events, announcements, and `/registration/me`.
- Added ObjectId validation on resource routes and predictable JSON 404/error responses.
- Added stricter IP rate limits for sensitive auth, registration, and payment route groups.
- Added query indexes for registration ownership and published announcement ordering.
- Replaced insecure OTP randomness with `crypto.randomInt`.
- Prevented production responses from exposing caught internal error messages.
- Added tests for pagination, ObjectId validation, and OTP format.
- Wrapped individual/team registration and cancellation writes in MongoDB transactions.
- Added `docs/API.md`, `.env.example` entries, API/load test scripts, and a Postman collection.

## Root Cause Of `/api/events` Failure

The route is mounted at `/api/events`, delegates to `eventController.listEvents`, and returns a response when MongoDB is connected. Baseline smoke tests returned HTTP 200 with `{ success: true, data: [] }`; no failed socket was reproduced. The endpoint now has bounded query work and returns HTTP 400 for invalid pagination instead of accepting unbounded input.

## Remaining Risks

Team capacity semantics should be explicitly confirmed: the current counter reserves one seat per registration, including a team registration. Payment verification should also be paired with Razorpay order/payment API reconciliation and idempotency keys for production financial guarantees. SMTP remains synchronous and should move to a queue if signup volume requires it.

## Verification

- `npm test`: 6 passing tests.
- `GET /health`: HTTP 200 with MongoDB connected in the local environment.
- `GET /api/events`: HTTP 200.
- `GET /api/events?limit=1000`: HTTP 400.
- Unknown route: HTTP 404 JSON.
- Local benchmark before pagination: `/health` about 20,700 req/s; `/api/events` about 53.5 req/s at concurrency 10 and 43.2 req/s at concurrency 50, with zero observed errors. A comparable post-change benchmark should be run in the target deployment environment.
- Post-change `autocannon -c 10 -d 10 /api/events`: 497 successful requests, 48.7 req/s average, p50 129 ms, p97.5 735 ms, p99 861 ms, maximum 1,019 ms, zero errors.
- MongoDB capability check: Atlas replica set with logical sessions enabled; transactional registration code is supported by the configured deployment.
- Redis cache benchmark: 10,779.9 req/s at 100 connections and 14,573.2 req/s at 250 connections with zero reported errors. At 500 connections throughput fell to 4,965.2 req/s with severe latency variance, so 20,000 req/s is not supported reliably by this single host.
