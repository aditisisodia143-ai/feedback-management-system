# PeerPulse: Peer Feedback Management System

A MERN-stack app where students give each other feedback (rating + comment per category), and an admin moderates everything.

**Stack:** React (Vite) + Tailwind · Node.js + Express · MongoDB Atlas + Mongoose · JWT + bcrypt
**Deploy:** Frontend on Vercel · Backend on Render · Database on MongoDB Atlas

---

## Features

**Students**
- Register (validated: email, 10-digit phone, roll no like `23BCS1042`, password ≥ 6 chars) and log in
- Browse all students with search (name / roll no) and filters (department / year)
- Open a profile, see the average rating, and give feedback: category, 1–5 stars, comment, optional anonymous
- One feedback per category per student; self-feedback is blocked (frontend + backend)
- **Feedback Received:** anonymous givers show as "Anonymous"
- **Feedback Given:** edit or delete your own feedback

**Admin**
- Stats: total students, total feedback, average rating, top 3 rated (minimum 2 feedback)
- All feedback table with search, category and rating filters; edit and delete
- Always sees the real giver, even for anonymous feedback
- Students table; deleting a student also deletes all feedback they gave **and** received

---

## Project structure

```
feedback-management-system/
├── server/
│   ├── config/db.js              # MongoDB connection
│   ├── models/User.js            # user schema + password hashing
│   ├── models/Feedback.js        # feedback schema + unique index
│   ├── middleware/auth.js        # protect, adminOnly, studentOnly
│   ├── middleware/errorHandler.js
│   ├── controllers/              # the logic for each route
│   ├── routes/                   # URL → controller mapping
│   ├── utils/                    # asyncHandler, token, helpers
│   ├── seed.js                   # realistic demo data
│   └── server.js                 # app entry point
└── client/
    ├── src/api/axios.js          # API client (adds JWT automatically)
    ├── src/context/AuthContext.jsx
    ├── src/components/           # Navbar, ProtectedRoute, StarRating, modals...
    ├── src/pages/                # Login, Register, Students, Profile, Received, Given, Admin
    └── vercel.json               # stops 404 on page refresh
```

---

## Run it locally

You need **Node.js 20+** and a free **MongoDB Atlas** cluster (steps in the deployment guide below).

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```
Fill in `server/.env`:

| Variable | Example | What it is |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/peer-feedback` | Atlas connection string |
| `JWT_SECRET` | any long random string | signs login tokens |
| `PORT` | `5000` | backend port |
| `CLIENT_URL` | `http://localhost:5173` | allowed frontend (CORS) |

```bash
npm run seed    # loads demo data (WARNING: wipes existing data)
npm run dev     # starts the API on http://localhost:5000
```

### 2. Frontend (in a second terminal)
```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm run dev               # opens http://localhost:5173
```

### Demo logins (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@college.edu` | `admin123` |
| Student | `aarav.sharma@student.college.edu` | `student123` |

All 10 students use `firstname.lastname@student.college.edu` / `student123`
(e.g. `vikram.rathore@student.college.edu`). The seed also adds 25 realistic feedback entries.

---

## API reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create student account |
| POST | `/api/auth/login` | Public | Log in, get JWT |
| GET | `/api/auth/me` | Logged in | Current user |
| GET | `/api/students?search=&department=&year=` | Student | Directory (excludes self + admin) |
| GET | `/api/students/:id` | Student | Profile + average rating |
| POST | `/api/feedback` | Student | Give feedback (blocks self + duplicates) |
| GET | `/api/feedback/received` | Student | Feedback about me (anonymous hidden) |
| GET | `/api/feedback/given` | Student | Feedback I wrote |
| PUT | `/api/feedback/:id` | Student | Edit my own feedback |
| DELETE | `/api/feedback/:id` | Student | Delete my own feedback |
| GET | `/api/admin/stats` | Admin | Dashboard numbers |
| GET | `/api/admin/feedback?search=&category=&rating=` | Admin | All feedback, real givers |
| PUT | `/api/admin/feedback/:id` | Admin | Edit any feedback |
| DELETE | `/api/admin/feedback/:id` | Admin | Delete any feedback |
| GET | `/api/admin/students` | Admin | All students |
| DELETE | `/api/admin/students/:id` | Admin | Delete student + their feedback |

Protected routes need the header `Authorization: Bearer <token>`.

---

## Deployment guide

Do these in order: **Atlas → Render → Vercel → update CORS**.

### Step 1: MongoDB Atlas (database)
1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access** → Add New Database User → username + password (save them).
3. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`). Render's IPs change, so this is needed.
4. **Connect → Drivers** → copy the connection string. Replace `<password>` and add the database name before the `?`:
   `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/peer-feedback?retryWrites=true&w=majority`
5. Put it in `server/.env` and run `npm run seed` once from your computer to load the demo data.

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Peer feedback management system"
git branch -M main
git remote add origin https://github.com/<your-username>/feedback-management-system.git
git push -u origin main
```
`.gitignore` already keeps `node_modules` and `.env` out of GitHub.

### Step 3: Render (backend)
1. https://render.com → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
3. **Environment variables:** `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (leave as `http://localhost:5173` for now). Render sets `PORT` itself.
4. Deploy, then open `https://<your-service>.onrender.com/`. You should see `{"message":"Peer Feedback API is running"}`.

### Step 4: Vercel (frontend)
1. https://vercel.com → **Add New → Project** → import the same repo.
2. **Root Directory:** `client` (Vercel detects Vite automatically).
3. **Environment variable:** `VITE_API_URL` = your Render URL, e.g. `https://peer-feedback-api.onrender.com` (no trailing slash).
4. Deploy and copy your Vercel URL, e.g. `https://peer-feedback.vercel.app`.

### Step 5: Update CORS
Back in Render → your service → **Environment** → set `CLIENT_URL` to your Vercel URL (exact, no trailing slash) → save. Render redeploys automatically. Done.

### Before a demo
Render's free tier **sleeps after ~15 min of inactivity**, so the first request can take 30–60 seconds. Open the backend URL a minute before showing it. The app shows a "server is waking up" message while it loads.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed` | Check the password in `MONGO_URI`, and that Network Access includes `0.0.0.0/0` |
| "Not allowed by CORS" | `CLIENT_URL` on Render must exactly match the Vercel URL |
| Login works locally but not online | `VITE_API_URL` on Vercel must be the Render URL; redeploy Vercel after changing it |
| 404 when refreshing a page on Vercel | Make sure `client/vercel.json` was pushed |
| Logged out unexpectedly | Tokens expire after 7 days. Log in again |
