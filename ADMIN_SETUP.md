# Admin Authentication Setup Guide

## Overview
The admin authentication system now uses Supabase for password management instead of environment variables. This provides better security and easier password management.

## Database Setup

### 1. Update Supabase Schema
Run the updated `supabase-schema.sql` file in your Supabase SQL editor to create the necessary tables and functions:

```sql
-- This creates:
-- - admin_settings table (stores password hash)
-- - verify_admin_password function
-- - update_admin_password function
```

### 2. Initialize Admin Password
After setting up the database, initialize the admin password by making a POST request to the initialization endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/initialize \
  -H "Content-Type: application/json" \
  -d '{"password": "your_secure_password"}'
```

Or use a tool like Postman/Insomnia:
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
The login form now only requires a password (no username needed):

- **URL**: `/admin` tab in the application
- **Required**: Password only
- **Password Reset**: Available via "Reset Password?" link

### Password Reset
Admins can change their password from within the admin panel:
1. Log in with current password
2. Go to Settings (or use the reset link on login page)
3. Enter current password and new password
4. Submit to update

## API Endpoints

### POST `/api/admin/login`
Authenticate with password only.

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

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

### POST `/api/admin/reset-password`
Update admin password.

**Request:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

### POST `/api/admin/initialize`
Initialize admin password (one-time setup).

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

## Security Notes

### Current Implementation
- Passwords are stored in plain text in the database (for simplicity)
- In production, consider implementing proper password hashing (bcrypt)

### Production Recommendations
1. **Use bcrypt for password hashing**:
   - Install: `npm install bcrypt`
   - Update `lib/db.ts` to hash passwords before storing
   - Update verification to compare hashed passwords

2. **Add rate limiting**:
   - Prevent brute force attacks on login
   - Use Next.js middleware or API route protection

3. **Add session management**:
   - Store sessions in Supabase or Redis
   - Implement session expiration
   - Add refresh token logic

4. **Enable SSL/TLS**:
   - Always use HTTPS in production
   - Configure Supabase to enforce secure connections

## Troubleshooting

### "Admin settings not found" error
- Solution: Run the initialization endpoint to create the admin settings record

### "Invalid password" error
- Verify the password was initialized correctly
- Check the admin_settings table in Supabase
- Re-initialize if needed

### Database connection errors
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Ensure the service role key has correct permissions

## Migration from Environment Variables

If you were previously using `ADMIN_PASSWORD` environment variable:

1. **Initialize the new system**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/initialize \
     -H "Content-Type: application/json" \
     -d '{"password": "your_old_password"}'
   ```

2. **Remove old environment variable**:
   - Delete `ADMIN_PASSWORD` from `.env.local`
   - Update `.env.example` (already done)

3. **Test login**:
   - Try logging in with your password
   - Verify password reset functionality

## Database Functions

The following functions are created in Supabase:

### `verify_admin_password(password_text TEXT)`
Returns TRUE if the password matches the stored password.

### `update_admin_password(new_password TEXT)`
Updates the admin password in the database.

## Admin Settings Table Structure

```sql
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_password_hash VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps

1. ✅ Update Supabase schema with `supabase-schema.sql`
2. ✅ Initialize admin password via API endpoint
3. ✅ Test login functionality
4. ✅ Test password reset functionality
5. ⚠️ Consider implementing bcrypt for production
6. ⚠️ Add rate limiting for security
7. ⚠️ Implement proper session management