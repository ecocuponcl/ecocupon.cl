# 🚀 EcoCupon Setup Guide

## Quick Start

### 1. Database Setup (Required)

The application requires Supabase database tables to be created before running.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/uyxvzztnsvfcqmgkrnol/sql/new
2. Copy the contents of `scripts/setup-supabase.sql`
3. Paste into the SQL Editor
4. Click **Run**

**Option B: Using MCP (if available)**

If you have the Supabase MCP configured in your IDE, you can use it to run the SQL.

### 2. Environment Variables

The `.env.local` file is already configured with the correct credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uyxvzztnsvfcqmgkrnol.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

The application will be available at: http://localhost:3000

---

## MCP Configuration

The Supabase MCP is configured in `mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=uyxvzztnsvfcqmgkrnol"
    }
  }
}
```

This allows your IDE to connect directly to the Supabase project for:
- Schema introspection
- Query assistance
- Database management

---

## Troubleshooting

### Error: "Could not find the table 'public.categories'"

This means the database tables haven't been created yet. Follow step 1 above.

### Error: "Connection refused"

Make sure your `.env.local` file exists and contains the correct credentials.

### Port Already in Use

If port 3000 is busy, run:
```bash
pnpm dev -- -p 3001
```

---

## Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   ├── logger.ts          # Logging utilities
│   └── utils.ts           # Helper functions
├── scripts/
│   ├── setup-supabase.sql # Database setup script
│   └── init-db.js         # Database initialization (Node.js)
└── .env.local             # Environment variables (not in git)
```

---

## Database Schema

The application uses the following tables:

- **categories**: Product categories (technology, fashion, home, etc.)
- **products**: Product catalog with prices and images
- **knasta_prices**: Discounted prices from Knasta
- **product_specs**: Product specifications
- **profiles**: User profiles

---

## Support

For issues or questions:
- GitHub Issues: [Create an issue]
- Email: soporte@ecocupon.cl

---

**Developed with ❤️ in Chile 🇨🇱**
