# AdMiro API - Authentication Setup

## Environment Configuration

The API requires the following environment variables to be set in `.env`:

```env
# Server Configuration
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/admiro

# JWT Configuration
JWT_SECRET=<your-generated-secret>
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>.apps.googleusercontent.com

# Environment
NODE_ENV=development
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if prompted
6. Select "Web application" as the application type
7. Add authorized redirect URIs (e.g., `http://localhost:3000/auth/google/callback`)
8. Copy the generated Client ID and paste it into your `.env` file

### JWT Secret

The `.env` file includes a pre-generated JWT secret. For production, generate a new one:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Endpoints

### Authentication Routes (`/api/auth`)

All authentication endpoints are rate-limited to **5 requests per 15 minutes** per IP address to prevent brute-force attacks.

#### Public Endpoints

**POST `/api/auth/register`**
- Register a new user with email/password
- Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADVERTISER"
  }
  ```
- Response: `{ user, token }`

**POST `/api/auth/login`**
- Login with email/password
- Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- Response: `{ user, token }`

**POST `/api/auth/google`**
- Authenticate with Google OAuth token
- Request body:
  ```json
  {
    "token": "<google-oauth-token>"
  }
  ```
- Response: `{ user, token, isNewUser }`
- Note: Links to existing account if email matches

#### Protected Endpoints

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

**GET `/api/auth/me`**
- Get current user profile
- Response: `{ user }`

**POST `/api/auth/refresh`**
- Refresh JWT token (generates new token for current user)
- Response: `{ token }`

**POST `/api/auth/change-password`**
- Change user password
- Request body:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```
- Response: `{ message: "Password changed successfully" }`

**POST `/api/auth/logout`**
- Logout (currently a placeholder - token remains valid until expiry)
- Response: `{ message: "Logged out successfully" }`

## Rate Limiting

### Authentication Endpoints (`/api/auth/*`)
- **5 requests per 15 minutes** per IP
- Protects against brute-force attacks on login/register

### General API Endpoints
- **100 requests per 15 minutes** per IP
- Protects against DoS attacks while allowing normal usage

Rate limit information is returned in response headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets

## Starting the API

```bash
# Development mode (with auto-reload)
npm run dev --workspace=@admiro/api

# Production build
npm run build --workspace=@admiro/api
npm run start --workspace=@admiro/api
```

## Database Connection

The API connects to MongoDB on startup. Ensure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 --name admiro-mongo mongo:latest

# Or using local MongoDB installation
mongod --dbpath /path/to/data
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed tokens with 7-day expiration
3. **Rate Limiting**: Prevents brute-force and DoS attacks
4. **Helmet.js**: Security headers for Express
5. **CORS**: Cross-origin resource sharing enabled
6. **User Validation**: Active user status checked on protected routes

## Testing with cURL

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "ADVERTISER"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace <token> with actual JWT)
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Architecture

The authentication system follows Clean Architecture and SOLID principles:

```
Request → Rate Limiter → Controller → Service → Repository → Database
```

- **Controller** (`auth.controller.ts`): HTTP request/response handling
- **Service** (`auth.service.ts`): Business logic, token generation, password hashing
- **Repository** (`user.repository.ts`): Database operations abstraction
- **Middleware** (`auth.middleware.ts`): JWT verification and user attachment

All components are loosely coupled through dependency injection, making the system testable and maintainable.
