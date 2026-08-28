# Chaitaniya Backend URLs

Base URL:

```text
http://localhost:3000
```

Production base URL: `TBD`
Frontend URL: `TBD`

## Health

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Server and database health |

## Authentication

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register a user and send verification OTP |
| POST | `/api/auth/login` | No | Verify credentials and return a JWT |
| POST | `/api/auth/verify-otp` | No | Verify a registration email OTP |
| POST | `/api/auth/resend-otp` | No | Generate and send a new registration email OTP |
| POST | `/api/auth/forgot-password` | No | Send a password reset OTP without revealing account existence |
| POST | `/api/auth/reset-password` | No | Set a new password using a valid reset OTP |
| POST | `/api/auth/logout` | No | Confirm client-side JWT logout |
| POST | `/api/auth/google` | No | Verify a Google ID token and issue a JWT |
| POST | `/api/auth/refresh` | No | Rotate a Redis-backed refresh token and issue a new JWT |

## Events

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/events` | No | List published events; supports `category` and `featured` filters |
| GET | `/api/events/:id` | No | Get an event |
| POST | `/api/events` | Bearer JWT + admin | Create an event |
| PATCH | `/api/events/:id` | Bearer JWT + admin | Update an event |
| DELETE | `/api/events/:id` | Bearer JWT + admin | Cancel an event |

## Registrations

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/registration/individual` | Bearer JWT | Register individually for an event |
| POST | `/api/registration/team/create` | Bearer JWT | Create a team for an event and receive its join code |
| POST | `/api/registration/team/join` | Bearer JWT | Join an existing event team using its join code |
| GET | `/api/registration/me` | Bearer JWT | List the current user's registrations |
| DELETE | `/api/registration/:id` | Bearer JWT | Cancel a registration |

## Payments

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/payments/orders` | Bearer JWT | Create a Razorpay order using the event's server-side fee |
| POST | `/api/payments/verify` | Bearer JWT | Verify the Razorpay payment signature |

## Announcements

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/announcements` | No | List published announcements |
| POST | `/api/announcements` | Bearer JWT + admin | Create an announcement |
| PATCH | `/api/announcements/:id` | Bearer JWT + admin | Update or publish an announcement |
| DELETE | `/api/announcements/:id` | Bearer JWT + admin | Delete an announcement |

## ID Cards

| Method | URL | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/id-card/me` | Bearer JWT | Get the authenticated participant's ID-card data |

### Register

JSON body:

```json
{
	"name": "Test User",
	"email": "your-email@gmail.com",
	"password": "Test@123"
}
```

### Verify Registration OTP

JSON body:

```json
{
	"email": "your-email@gmail.com",
	"otp": "123456"
}
```
