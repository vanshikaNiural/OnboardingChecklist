# Deployment Checklist

Use this to track progress from local dev → Railway production.

## Pre-deployment (Local)

- [ ] All components created: `Dashboard`, `OnboardingPanel`, `OnboardingItem`
- [ ] Supabase client configured in `lib/supabase/client.ts`
- [ ] `.env.local` created with Supabase credentials
- [ ] Migration SQL executed on Supabase project
- [ ] `npm run dev` works without errors
- [ ] Dashboard loads and displays items
- [ ] Can click status circles to change status
- [ ] Can add dates and notes
- [ ] Real-time sync works (test with 2 tabs)

## Pre-deployment (Git)

- [ ] No uncommitted changes: `git status` is clean
- [ ] All files added: `git add .`
- [ ] Committed: `git commit -m "Initial commit: Niural GP onboarding dashboard"`
- [ ] Pushed to GitHub: `git push origin main`
- [ ] Repository is public (Railway can see it)

## Production Setup (Railway)

- [ ] Railway account created
- [ ] Project created → GitHub repo connected
- [ ] Supabase **production project** created (separate from dev)
  - [ ] Migration SQL executed on production database
  - [ ] Project **NOT paused**
  - [ ] Can authenticate with prod credentials
- [ ] Environment variables added to Railway:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (production)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
  - [ ] `NODE_ENV=production`
- [ ] Build succeeds: check Railway logs
- [ ] App deployed and live at Railway URL
- [ ] Can access production dashboard
- [ ] Status updates persist

## Post-deployment (Validation)

- [ ] Dashboard loads without errors (check browser console)
- [ ] All 5 stakeholder tabs visible
- [ ] Clicking status circles works
- [ ] Adding dates/notes persists across page reload
- [ ] Real-time works (test with 2 browser windows)
- [ ] Supabase → **SQL Editor** shows populated tables

## Monitoring

- [ ] Set up Railway alerts (optional but recommended)
- [ ] Monitor Supabase performance: **Logs** tab
- [ ] Check monthly usage: both services offer free tiers

## Troubleshooting During Deployment

If stuck, check:
1. **Railway logs** — go to Railway project → View logs
2. **Supabase status** — is the database active?
3. **Environment variables** — are they set correctly?
4. **PostgreSQL errors** — Supabase → SQL Editor → check recent queries

---

## Done!

Congratulations 🎉 Your Niural GP onboarding dashboard is live on Railway!

Share the URL with your team and start tracking payroll onboarding workflows.
