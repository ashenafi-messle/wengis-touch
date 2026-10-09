# Admin Authentication Setup Guide

## Overview
The admin authentication system uses Neon PostgreSQL for password management instead of environment variables. This provides persistence and secure password management.

## Database Setup

### 1. Run Neon Schema
Apply the database schema from `neon-schema.sql` to your Neon PostgreSQL instance:

```bash
# Set your DATABASE_URL in .env, then run:
node scripts/migrate-data-to-neon.js
```

### 2. Initialize Admin Password
After setting up the database, initialize the admin password by making a POST request to the initialization endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/initialize \
  -H "Content-Type: application/json" \
  -d '{"password": "your_secure_password"}'
```

Or using an API testing client:
- URL: `http://localhost:3000/api/admin/initialize`
- Method: POST
- Body (JSON):
  ```json
  {
    "password": "your_secure_password"
  }
  ```

## Usage

### Admin Login
The login form requires the admin password:
- **URL**: Admin tab in the application
- **Required**: Password only

## API Endpoints

### POST `/api/admin/login`
Authenticate with password.

**Request:**
```json
{
  "password": "your_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "wengi-session-1234567890",
  "username": "Admin Wengi"
}
```

### POST `/api/admin/initialize`
Initialize admin password.

**Request:**
```json
{
  "password": "initial_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin password initialized successfully"
}
```