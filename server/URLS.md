# Local API URLs

Base URL:

```text
http://localhost:3000
```

## Registration

```text
POST http://localhost:3000/api/auth/register
```

JSON body:

```json
{
	"name": "Test User",
	"email": "your-email@gmail.com",
	"password": "Test@123",
	"teamName": "Test Team"
}
```

## Verify Registration OTP

```text
POST http://localhost:3000/api/auth/verify-otp
```

JSON body:

```json
{
	"email": "your-email@gmail.com",
	"otp": "123456"
}
```
