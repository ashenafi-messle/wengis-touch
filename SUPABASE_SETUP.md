# Supabase Setup Guide for Wengi's Touch

This guide will help you set up Supabase for the Wengi's Touch full-stack Next.js application.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js and npm installed
- Basic knowledge of database concepts

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: wengi-touch (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the region closest to your target audience
5. Click "Create new project"
6. Wait for the project to be provisioned (this may take 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to the **Settings** → **API** section
2. Copy the following values:
   - **Project URL**: Found under "Project API keys"
   - **anon public**: Found under "Project API keys" (this is your anon key)
   - **service_role**: Found under "Project API keys" (this is your service role key - keep this secret!)

## Step 3: Set Up Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD=wengi123
   ```

3. Replace the placeholder values with your actual Supabase credentials from Step 2

## Step 4: Create Database Tables

You have two options to create the database tables:

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase-schema.sql` file
5. Paste it into the SQL Editor
6. Click "Run" to execute the schema creation
7. Verify that all tables were created successfully

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Step 5: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `products`
   - `orders`
   - `order_items`
   - `messages`
3. Click on each table to verify the structure and sample data

## Step 6: Set Up Storage for Product Images

Since the admin panel now supports uploading product images from your device, you need to set up a Supabase storage bucket:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click "New Bucket"
4. Create a bucket named `product-images`
5. Make the bucket **Public** (this is important for images to display on your website)
6. Configure the bucket policies:
   - Allow public read access (so images can be displayed)
   - Allow authenticated uploads (for admin use)

### Storage Bucket SQL Setup

Alternatively, you can set up the storage bucket using SQL in the SQL Editor:

```sql
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Allow public read access to product images
CREATE POLICY "Public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## Step 7: Configure Row Level Security (Optional but Recommended)

For production applications, you should enable Row Level Security (RLS). Add these policies in the SQL Editor:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public read access to products" ON products
  FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access to products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Similar policies for other tables...
```

## Step 8: Test the Connection

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000` in your browser

3. Check the browser console for any Supabase connection errors

4. Try accessing the admin panel and verify that products are loading from the database

## Step 9: Admin Authentication

The admin panel uses a simple authentication system:

- **Default username**: `admin` or `wengi`
- **Default password**: `wengi123` (can be changed via the `ADMIN_PASSWORD` environment variable)

## Database Schema Overview

### Products Table
- Stores product information including category and colors (as text)
- Supports featured and bestseller flags
- Tracks availability status
- Images are stored as URLs (uploaded to Supabase storage)

### Orders Table
- Stores customer order information
- Links to order items for detailed line items
- Tracks order status through the fulfillment process

### Order Items Table
- Stores individual items within an order
- Links to products for reference
- Tracks quantity and price at time of order
- Stores color selection (as text)

### Messages Table
- Stores contact form submissions
- Tracks read/unread status
- Stores customer contact information

## Currency Configuration

The application now uses Ethiopian Birr (ETB) as the default currency:

- All prices are stored as numbers in the database
- Display formatting is handled by the `formatCurrency` utility function
- Prices are displayed as "ETB 1,234" format

## Troubleshooting

### Connection Issues
- Verify your environment variables are set correctly
- Check that your Supabase project is active
- Ensure your database is not paused (Supabase free tier pauses after 1 week of inactivity)

### Permission Errors
- Verify you're using the correct API keys
- Check that RLS policies allow the necessary operations
- Ensure the service role key is being used for server-side operations

### Data Not Loading
- Check the browser console for error messages
- Verify the API routes are working correctly
- Ensure the database tables contain data

## Next Steps

1. Configure your Supabase project for production
2. Set up proper RLS policies for security
3. Configure database backups
4. Set up monitoring and logging
5. Deploy your Next.js application

## Support

For issues specific to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **This Application**: Review the code and inline comments