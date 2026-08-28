# Chaitaniya Backend API

Base URL: `http://localhost:3000`

All JSON errors use `{ success: false, message, error }` where implemented. Bearer routes require `Authorization: Bearer <access token>`. Admin routes also require `role: admin`.

## Health

| Method | URL | Auth | Request | Success |
|---|---|---|---|---|
| GET | `/health` | None | None | `200 { status, database, redis, uptime, timestamp, environment }`; `503` when MongoDB is disconnected |

## Auth

| Method | URL | Auth | Body | Success / errors |
|---|---|---|---|---|
| POST | `/api/auth/register` | None | `{ name, email, password }`; password minimum 8 chars | `201 { message }`; `400` validation, `409` duplicate |
| POST | `/api/auth/login` | None | `{ email, password }` | `200 { message, token, refreshToken, refreshTokenExpiresIn, role, isAdmin }`; `400` credentials, `403` unverified |
| POST | `/api/auth/verify-otp` | None | `{ email, otp }` | `200 { message }`; `400` invalid/expired OTP, `404` user |
| POST | `/api/auth/forgot-password` | None | `{ email }` | Always `200 { message }` for account privacy |
| POST | `/api/auth/reset-password` | None | `{ email, otp, password }`; password minimum 8 chars | `200 { message }`; `400` invalid input/OTP |
| POST | `/api/auth/logout` | None | `{ refreshToken }` | `200 { message }` |
| POST | `/api/auth/google` | None | `{ idToken }` | `200` token response; `400`, `401`, `404`, or `503` |
| POST | `/api/auth/refresh` | None | `{ refreshToken }` | `200` rotated token response; `401` invalid session, `503` unavailable |

Auth routes have general and sensitive IP rate limits.

## Events

| Method | URL | Auth | Body/query/path | Success / errors |
|---|---|---|---|---|
| GET | `/api/events` | None | Query `category`, `featured=true|false`, `page>=1`, `limit=1..100` | `200 { success, data, pagination }`; `400` invalid query |
| GET | `/api/events/:id` | None | Valid MongoDB ObjectId path | `200 { success, data }`; `400` invalid ID, `404` missing |
| POST | `/api/events` | Admin | Event fields: `title`, `description`, `category`, `capacity>=1`, optional `fee>=0`, `startsAt`, `endsAt`, `venue`, optional rules/prize/coordinators/images/featured/status | `201 { success, message, data }`; `400` validation, `401/403` auth |
| PATCH | `/api/events/:id` | Admin | Partial event fields | `200`; `400`, `401/403`, `404` |
| DELETE | `/api/events/:id` | Admin | Valid ObjectId | `200` cancellation; `400`, `401/403`, `404` |

Example list request: `GET /api/events?page=1&limit=20&featured=true`

## Registrations

| Method | URL | Auth | Body/query/path | Success / errors |
|---|---|---|---|---|
| POST | `/api/registration/individual` | Bearer | `{ eventId }` | `201 { success, message, data }`; `400`, `401`, `409` full/duplicate |
| POST | `/api/registration/team/create` | Bearer | `{ eventId, teamName }` | `201 { success, message, data: { registration, teamCode, teamName } }`; `400`, `401`, `409` |
| POST | `/api/registration/team/join` | Bearer | `{ eventId, teamCode }` | `201` team response; `400`, `401`, `404`, `409` |
| GET | `/api/registration/me` | Bearer | Query `page`, `limit` | `200 { success, data, pagination }`; `400`, `401` |
| DELETE | `/api/registration/:id` | Bearer | Valid registration ObjectId | `200` cancellation; `400`, `401`, `404` |

## Payments

| Method | URL | Auth | Body | Success / errors |
|---|---|---|---|---|
| POST | `/api/payments/orders` | Bearer | `{ registrationId }` | `201 { success, data }`; `400`, `401`, `404`, `503` |
| POST | `/api/payments/verify` | Bearer | `{ registrationId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` | `200` verified; `400` invalid signature, `401`, `404`, `503` |

Payment amount is read from the server-side event fee and signatures are verified server-side.

## Announcements

| Method | URL | Auth | Body/query/path | Success / errors |
|---|---|---|---|---|
| GET | `/api/announcements` | None | Query `page`, `limit` | `200 { success, data, pagination }`; `400` invalid pagination |
| POST | `/api/announcements` | Admin | `{ title, message, published? }` | `201`; `400`, `401/403` |
| PATCH | `/api/announcements/:id` | Admin | Partial `{ title, message, published? }` | `200`; `400`, `401/403`, `404` |
| DELETE | `/api/announcements/:id` | Admin | Valid ObjectId | `200`; `400`, `401/403`, `404` |

## ID Cards

| Method | URL | Auth | Success / errors |
|---|---|---|---|
| GET | `/api/id-card/me` | Bearer | `200 { success, data: { participantId, name, email, registrations } }`; `401` |

Unknown routes return `404 { success: false, message: "Route not found", error: "NOT_FOUND" }`.
