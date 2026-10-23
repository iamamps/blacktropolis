# The Divine Nine Events

National events hub for the nine NPHC organizations (Alpha Phi Alpha, Kappa Alpha Psi, Omega Psi Phi, Phi Beta Sigma,
Iota Phi Theta, Alpha Kappa Alpha, Delta Sigma Theta, Zeta Phi Beta, Sigma Gamma Rho) — every campus, every HBCU.

Next.js 15 app (Vercel) + Supabase Postgres/Storage + Stripe.

## Environment
DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_BUSINESS_PRICE_ID, STRIPE_TEST_PRICE_ID, SMTP_*, ADMIN_PASSCODE,
SESSION_SECRET (signs login cookies), NEXT_PUBLIC_APP_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (signed uploads).

## Database
Additive SQL migrations live in `db/migrations/` (safe to re-run).
