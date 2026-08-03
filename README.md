# Wengi's Touch - Full-Stack E-Commerce Application

A beautiful, full-stack Next.js e-commerce application for handcrafted crochet products, now powered by Supabase for data persistence.

## Features

- **Product Catalog**: Browse and search handcrafted crochet products
- **Shopping Cart**: Add items to cart with custom colors and sizes
- **Order Management**: Complete order processing workflow
- **Admin Dashboard**: Manage products, orders, and customer messages
- **Multi-language Support**: English and Amharic (Ethiopian) language support
- **Ethiopian Birr Currency**: All prices displayed in ETB (ብር)
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Database**: Powered by Supabase for reliable data storage

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
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

3. Set up Supabase:
   - Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a Supabase project
   - Run the database schema from `supabase-schema.sql`
   - Configure your environment variables

4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD=wengi123
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
│   │   └── admin/          # Admin authentication
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
│   ├── supabase.ts       # Supabase client configuration
│   ├── db.ts             # Database operations
│   └── store.ts          # Legacy in-memory store (deprecated)
├── supabase-schema.sql   # Database schema
├── .env.example          # Environment variables template
└── SUPABASE_SETUP.md     # Detailed Supabase setup guide
```

## Database Schema

The application uses four main tables:

- **products**: Product information with colors, sizes, materials
- **orders**: Customer orders with status tracking
- **order_items**: Individual items within orders
- **messages**: Contact form submissions

See [supabase-schema.sql](./supabase-schema.sql) for the complete schema definition.

## API Endpoints

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

## Admin Panel

Access the admin panel by clicking the admin link in the footer or navigating to `/admin`.

**Default credentials:**
- Username: `admin` or `wengi`
- Password: `wengi123` (configurable via `ADMIN_PASSWORD` env var)

## Currency

All prices are displayed in Ethiopian Birr (ETB):
- Format: `ETB 1,234` or `1,234 ብር`
- Stored as numbers in the database
- Formatted using the `formatCurrency` utility function

## Language Support

The application supports:
- English (en)
- Amharic (am) - Ethiopian language

Language can be toggled via the language switcher in the navigation.

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS
- Digital Ocean
- etc.

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `ADMIN_PASSWORD` - Admin panel password

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For detailed Supabase setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

For issues or questions, please contact the development team.

## Acknowledgments

- Beautiful crochet products by Wengi
- Built with modern web technologies
- Powered by Supabase and Next.js