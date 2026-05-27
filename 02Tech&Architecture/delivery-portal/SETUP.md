# DeliverEase MVP — Setup & Run Guide

---

## WHAT YOU NEED INSTALLED

- Node.js v18+ → https://nodejs.org
- npm (comes with Node)
- A Supabase account (free) → https://supabase.com

---

## STEP 1 — Get Your Supabase Database URL

1. Go to https://supabase.com → Sign Up (free)
2. Click "New Project"
   - Project name: `delivery-portal`
   - Set a database password (save it!)
   - Region: pick closest to India
3. Wait ~2 minutes for it to spin up
4. Go to: **Settings → Database**
5. Copy the **URI** under "Connection String" (the one starting with `postgresql://`)
6. Replace `[YOUR-PASSWORD]` with the password you set

---

## STEP 2 — Set Up the Backend

Open Terminal and run:

```bash
# Navigate to the backend folder
cd "path/to/delivery-portal/backend"

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Now open `backend/.env` and fill in:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres"
JWT_SECRET="delivery-portal-secret-key-2026"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

Then run:

```bash
# Push the database schema (creates all tables)
npm run db:generate
npm run db:push

# Load dummy data + test accounts
npm run seed

# Start the backend server
npm run dev
```

You should see: `🚀 Server running on http://localhost:5000`

---

## STEP 3 — Set Up the Frontend

Open a NEW terminal tab and run:

```bash
# Navigate to the frontend folder
cd "path/to/delivery-portal/frontend"

# Install dependencies
npm install

# Create your .env.local file
cp .env.local.example .env.local
```

The `.env.local` file should have:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Then run:
```bash
npm run dev
```

You should see: `ready - started server on http://localhost:3000`

---

## STEP 4 — Open the App

Go to: **http://localhost:3000**

You'll see the landing page with 3 portal buttons.

---

## TEST ACCOUNTS (after seeding)

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@delivery.com     | admin123     |
| Customer | rahul@gmail.com        | password123  |
| Customer | priya@gmail.com        | password123  |
| Customer | arjun@gmail.com        | password123  |
| Partner  | raju@partner.com       | partner123   |
| Partner  | suresh@partner.com     | partner123   |
| Partner  | mohan@partner.com      | partner123   |

---

## DEMO TRACKING IDs (seeded orders)

| Tracking ID  | Status     |
|--------------|------------|
| TRKABC001    | In Transit |
| TRKDEF002    | Pending    |
| TRKGHI003    | Delivered  |
| TRKJKL004    | Assigned   |
| TRKMNO005    | Pending    |

---

## DEMO WORKFLOW (end-to-end)

1. **Customer books order:**
   - Login as `rahul@gmail.com`
   - Go to "New Order"
   - Fill in addresses, pick package type
   - See live price estimate
   - Submit → get tracking ID

2. **Admin assigns partner:**
   - Login as `admin@delivery.com`
   - Go to "All Orders" → find the pending order
   - Click "Assign" → pick a partner → confirm

3. **Partner accepts & updates:**
   - Login as `raju@partner.com`
   - Go to "Jobs" → "Available Jobs"
   - Accept → move to "My Jobs"
   - Update status: Picked Up → In Transit → Delivered

4. **Customer tracks:**
   - Use tracking ID on `/track` page (no login needed)
   - See live status timeline

---

## DEPLOYMENT (optional — after local testing works)

### Deploy Backend to Railway

1. Go to https://railway.app → Sign up with GitHub
2. New Project → Deploy from GitHub repo (or drag the `/backend` folder)
3. Add environment variables (same as .env):
   - `DATABASE_URL` = your Supabase URL
   - `JWT_SECRET` = your secret
   - `FRONTEND_URL` = your Vercel URL (add after step below)
4. Railway gives you a URL like: `https://your-app.railway.app`

### Deploy Frontend to Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Import project → select `/frontend` folder
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-app.railway.app/api`
4. Deploy → get your URL like: `https://delivery-portal.vercel.app`

5. Go back to Railway → update `FRONTEND_URL` to your Vercel URL

---

## COMMON ISSUES

**"CORS error" in browser:**
→ Make sure `FRONTEND_URL` in backend `.env` matches exactly where your frontend runs

**"Cannot connect to database":**
→ Double-check your Supabase `DATABASE_URL` — the password has special characters, URL-encode them

**"Module not found":**
→ Run `npm install` in both `/backend` and `/frontend`

**Schema not pushed:**
→ Run `npm run db:push` again from the `/backend` folder

---

Built with: Next.js · Express.js · Prisma · Supabase · Tailwind CSS · Zustand
