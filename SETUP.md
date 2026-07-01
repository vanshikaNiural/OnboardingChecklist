# Niural Global Payroll Onboarding — Setup & Deployment

This is a Next.js + Supabase application for tracking global payroll onboarding workflows.

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great)

### 1. Set up Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Go to **SQL Editor** and run the migration from `migrations/001_init_schema.sql`:
   - Click "New Query"
   - Paste the entire contents of the SQL file
   - Click "Run"

### 2. Configure environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install dependencies and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Railway

### 1. Prepare for deployment

```bash
# Make sure everything is committed
git add .
git commit -m "initial commit"
```

### 2. Create Railway account & project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest)
3. Create a new project
4. Connect your GitHub repository

### 3. Add Supabase environment variables to Railway

In your Railway project dashboard:

1. Go to **Variables**
2. Add the following:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
   - `NODE_ENV` = `production`

### 4. Set up database on Supabase (production)

If using the same Supabase project for production:
- The schema is already set up from local testing
- Just make sure the environment variables point to your Supabase project

If using a separate production project:
1. Create a new Supabase project
2. Run the migration SQL (`migrations/001_init_schema.sql`) on the production project
3. Update the environment variables in Railway to point to the production Supabase project

### 5. Deploy

Once environment variables are set:

1. Go to the Railway dashboard
2. Click "Deploy"
3. Wait for the build to complete (usually 2-5 minutes)
4. Your app will be live at the Railway-provided URL

## How it works

### Architecture

```
Frontend (Next.js React Components)
    ↓
Supabase Client (Real-time sync)
    ↓
PostgreSQL Database (Data persistence)
```

### Data flow

1. **Items** — onboarding checklist items (title, description, stage, gates, etc.)
2. **States** — user progress (status, completed date, notes)
3. **Changes are synced in real-time** across all connected users

### Key features

- ✅ Click status circles to cycle: Pending → In progress → Waiting → Blocked → Complete
- 📅 Add completion dates for tracking
- 📝 Add notes/validation comments to any item
- 🔄 Real-time sync across users viewing the same dashboard
- 🔒 Gates mark critical blocking items
- ♻️ Recurring tasks marked for payroll cycles

## Troubleshooting

### `Cannot find module '@/components/Dashboard'`

Make sure all component files are created:
- `components/Dashboard.tsx`
- `components/OnboardingPanel.tsx`
- `components/OnboardingItem.tsx`

### `Supabase connection failed`

1. Check that environment variables are set correctly in `.env.local`
2. Verify your Supabase project is active (not paused)
3. Run the migration SQL if you haven't yet

### Database schema not found

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and run the full migration from `migrations/001_init_schema.sql`

### Real-time not working

Ensure `supabase_realtime` publication is enabled:
1. Go to Supabase → **Publications**
2. Make sure `item_states` table is included

## Contributing

Changes to the onboarding checklist:

1. Update the data in `app/page.tsx` (the `DATA` object in `seedDatabase()`)
2. If you've already seeded, manually update or truncate the tables and reseed
3. Commit and push

## Cost

- **Supabase**: Free tier includes 500MB database, perfect for this
- **Railway**: Free tier includes $5/month credit (enough for this app)

Both services offer generous free tiers suitable for small teams.
