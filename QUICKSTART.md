# Quick Start — 5 Minutes

## Step 1: Create Supabase project (2 min)

1. Go to [supabase.com](https://supabase.com) → Sign up → Create project
2. Wait for it to initialize
3. Go to **Settings → API** and copy these two values:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

## Step 2: Run the migration (1 min)

1. In Supabase, go to **SQL Editor** → **New query**
2. Open `migrations/001_init_schema.sql` from this project
3. Copy the entire content and paste into the SQL editor
4. Click **Run**

## Step 3: Set up environment (1 min)

Create `.env.local` in this project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=<paste your URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste your key>
```

## Step 4: Run locally (1 min)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the dashboard with data!

---

## Deploy to Railway (when ready)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → Create new → GitHub repo
3. Add the same two environment variables
4. Deploy!

Done. Your app is live. 🚀
