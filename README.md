# Wengi's Touch - Full-Stack E-Commerce Application

A beautiful, full-stack Next.js e-commerce application for handcrafted crochet products, powered by Neon PostgreSQL for robust data persistence.

## Features

- **Product Catalog**: Browse and search handcrafted crochet products
- **Shopping Cart**: Add items to cart with custom colors and sizes
- **Order Management**: Complete order processing workflow
- **Admin Dashboard**: Manage products, orders, and customer messages
- **Multi-language Support**: English and Amharic (Ethiopian) language support
- **Ethiopian Birr Currency**: All prices displayed in ETB (ብር)
- **Responsive Design**: Beautiful UI that works on all devices
- **PostgreSQL Database**: Powered by Neon PostgreSQL for scalable serverless database operations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL (`pg` with connection pooling)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Neon PostgreSQL database account or connection string
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd wengi's-touch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Neon PostgreSQL:
   - Create a project on [Neon](https://neon.tech)
   - Copy your connection string into `.env` as `DATABASE_URL`
   - Run the schema migration:
     ```bash
     node scripts/migrate-data-to-neon.js
     ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Neon connection string:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
wengi's-touch/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── products/       # Product CRUD endpoints
│   │   ├── orders/         # Order management endpoints
│   │   ├── messages/       # Contact message endpoints
│   │   ├── admin/          # Admin authentication
│   │   ├── health/         # Health check & database connection test
│   │   └── upload/         # Media upload endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── src/
│   ├── components/         # React components
│   │   ├── Admin/         # Admin panel components
│   │   ├── ProductShowcase.tsx
│   │   ├── HeroSection.tsx
│   │   ├── CartDrawer.tsx
│   │   └── ...
│   ├── context/           # React contexts
│   │   └── LanguageContext.tsx
│   ├── types.ts           # TypeScript type definitions
│   ├── utils/             # Utility functions
│   │   └── currency.ts    # Currency formatting
│   └── data/              # Initial data
├── lib/                   # Library files
│   ├── neon.ts           # Neon PostgreSQL connection pool
│   ├── db.ts             # Database operations
│   └── store.ts          # Legacy in-memory store
├── scripts/
│   ├── migrate-data-to-neon.js      # Migration script
│   └── test-neon-db.js              # Database test script
├── neon-schema.sql        # Database schema
└── .env.example           # Environment variables template
```

## Database Schema

The application uses five main tables:

- **products**: Product information with colors, categories, and images
- **orders**: Customer orders with status tracking
- **order_items**: Individual items within orders
- **messages**: Contact form submissions
- **admin_settings**: Admin password management

See [neon-schema.sql](./neon-schema.sql) for the complete schema definition.

## API Endpoints

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/database` - Neon PostgreSQL connection verification

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]/status` - Update order status

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create new message
- `DELETE /api/messages/[id]` - Delete message
- `PATCH /api/messages/[id]/read` - Toggle read status

### Admin
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/initialize` - Admin password initialization

### Upload
- `POST /api/upload` - Product image upload endpoint

## Environment Variables

Required environment variables:

- `DATABASE_URL` - Neon PostgreSQL connection string (Server-side only)