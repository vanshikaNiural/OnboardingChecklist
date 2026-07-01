# Niural — Global Payroll Onboarding Dashboard

A full-stack web application for tracking global payroll onboarding workflows. Built with **Next.js 16** + **Supabase** + **Tailwind CSS**, deployable to **Railway** in minutes.

## Features

- ✅ **Interactive checklist** — click status circles to cycle through Pending → In Progress → Waiting → Blocked → Complete
- 📅 **Completion dates** — track when each item was finished
- 📝 **Notes & comments** — add validation notes to any item
- 🔄 **Real-time sync** — all users see updates instantly (via Supabase subscriptions)
- 👥 **5 stakeholder views** — Client, Employee, ICP, Navro, Internal (each with their own status counts)
- 🔒 **Gate tracking** — visual markers for critical blocking items
- ♻️ **Recurring tasks** — marked for multi-cycle payroll operations
- 📊 **Progress tracking** — total completion percentage at a glance

## Quick Start (5 minutes)

See **[QUICKSTART.md](./QUICKSTART.md)** for the fastest path to a working dashboard.

### TL;DR

```bash
# 1. Create Supabase project, get API keys
# 2. Run migration (migrations/001_init_schema.sql)
# 3. Create .env.local with your keys
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Run
npm install && npm run dev
# Open http://localhost:3000
```

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** — fastest setup (5 min)
- **[SETUP.md](./SETUP.md)** — detailed setup & Railway deployment
- **[ARCHITECTURE.md](#architecture)** (below) — how it works

## Architecture

### Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js 16, React 19, TypeScript | UI components, state management |
| Styling | Tailwind CSS 4 | responsive design |
| Backend | Supabase (PostgreSQL) | data persistence + real-time |
| Hosting | Railway | production deployment |

### Database Schema

```sql
onboarding_items
├── id (text, primary key)
├── stage_num (int) — 1-6 lifecycle stage
├── stakeholder_id (text) — client, employee, icp, navro, internal
├── title (text) — item description
├── description (text) — full context
├── is_gate (boolean) — critical blocker?
├── is_recurring (boolean) — multi-cycle task?
└── created_at, updated_at (timestamps)

item_states
├── id (text, primary key)
├── item_id (text, fk → onboarding_items)
├── status (enum) — pending, progress, waiting, blocked, complete
├── completed_date (text) — when finished
├── notes (text) — validation comments
└── created_at, updated_at (timestamps)

review_notes
├── id (text, primary key)
├── item_id (text, fk → onboarding_items)
├── review_type (text) — changed, removed, new, infer
├── tag (text) — short label
└── note (text) — explanation
```

### Data Flow

```
User clicks status circle
    ↓
React component updates state
    ↓
Supabase client sends update
    ↓
PostgreSQL row updated
    ↓
Real-time subscription fires
    ↓
All connected clients see change instantly
```

## Project Structure

```
niural-gp-onboarding/
├── app/
│   ├── page.tsx            # Main page, handles Supabase init & seeding
│   └── layout.tsx          # Root layout
├── components/
│   ├── Dashboard.tsx       # Header, tabs, progress tracker
│   ├── OnboardingPanel.tsx # Stage groups & status summary
│   └── OnboardingItem.tsx  # Individual checklist item
├── lib/
│   └── supabase/
│       └── client.ts       # Supabase client singleton
├── migrations/
│   └── 001_init_schema.sql # Database schema
├── public/                 # Static assets
├── QUICKSTART.md          # 5-minute setup guide
├── SETUP.md               # Full setup & deployment docs
├── Procfile               # Railway start command
└── tailwind.config.ts     # Tailwind CSS config
```

## Development

### Local development server

```bash
npm run dev
```

Opens at `http://localhost:3000` with hot-reload.

### Build for production

```bash
npm run build && npm run start
```

### Adding more onboarding items

Edit the `DATA` object in `app/page.tsx` → `seedDatabase()`:

```javascript
const DATA = {
  client: [
    { stage: 2, items: [
      { t: "Item title", d: "Item description", gate: true, recurring: true }
    ]}
  ]
  // ...
}
```

Then delete the data in Supabase and restart the app to reseed.

## Deployment to Railway

### Prerequisites
- GitHub account (Railway uses GitHub OAuth)
- Supabase project (free tier works)

### Steps

1. **Push to GitHub**
   ```bash
   git add . && git commit -m "initial" && git push origin main
   ```

2. **Create Railway project**
   - Go to [railway.app](https://railway.app)
   - Click "Create" → "GitHub Repo"
   - Select your repository

3. **Add environment variables**
   - In Railway dashboard, go to **Variables**
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes
   - Your app is live at the Railway-provided URL

## Cost Estimates

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Supabase | 500MB DB, 2GB egress/mo | ~$20 (at scale) |
| Railway | $5/mo credit | $5-20/mo (at scale) |
| **Total** | **Free** | **~$25 (overkill for small teams)** |

Both services have generous free tiers suitable for small teams (< 10 users).

## Troubleshooting

**Q: Getting "Cannot find module" errors?**
- Make sure all files in `components/` and `lib/` are created
- Run `npm install` again

**Q: Supabase connection fails?**
- Check `.env.local` has correct URL and key
- Verify Supabase project is active (not paused)
- Test connection: open DevTools → Network → check `/rest/v1` calls

**Q: Real-time updates not working?**
- Go to Supabase → **Publications**
- Ensure `supabase_realtime` publication includes `item_states` table

**Q: Data not seeding?**
- Make sure the migration SQL was run before first load
- Check Supabase → **SQL Editor** → see tables exist

## Support

For issues or questions:
- See [SETUP.md](./SETUP.md) for detailed troubleshooting
- Check Supabase docs: https://supabase.com/docs
- Railway docs: https://docs.railway.app
