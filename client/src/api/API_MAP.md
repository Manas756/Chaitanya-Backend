# API Map

Base URL: `VITE_API_URL` (defaults to `http://localhost:3000` for local development).

| Backend endpoint | Frontend surface |
|---|---|
| `GET /health` | Global API indicator |
| `POST /api/auth/register` | Signup |
| `POST /api/auth/login` | Login |
| `POST /api/auth/verify-otp` | Verify OTP |
| `POST /api/auth/resend-otp` | Resend OTP |
| `POST /api/auth/forgot-password` | Forgot password |
| `POST /api/auth/reset-password` | Reset password |
| `POST /api/auth/logout` | Dashboard logout |
| `POST /api/auth/google` | Not exposed until a Google client integration is configured |
| `POST /api/auth/refresh` | Backend token/session endpoint; automatic refresh is not yet required by current UI |
| `GET /api/events` | Home and Events |
| `GET /api/events/:id` | Event detail |
| `POST/PATCH/DELETE /api/events` | API Lab; admin UI requires an admin account and is not fabricated |
| `POST /api/registration/individual` | API Lab |
| `POST /api/registration/team/create` | API Lab |
| `POST /api/registration/team/join` | API Lab |
| `GET /api/registration/me` | Dashboard |
| `DELETE /api/registration/:id` | API Lab |
| `POST /api/payments/orders` | API Lab |
| `POST /api/payments/verify` | API Lab |
| `GET /api/announcements` | API Lab |
| `POST/PATCH/DELETE /api/announcements` | API Lab; admin UI requires an admin account and is not fabricated |
| `GET /api/id-card/me` | Available through API Lab; dedicated print UI is not claimed without a QR/ticket endpoint |
