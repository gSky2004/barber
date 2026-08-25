# Milestone Accessories — PERN Stack

Full-stack website for **Milestone Accessories**, Mbeya, Tanzania — barbershop, phone accessories, repair center, electrical goods, gaming station, and digital support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (JS), Vite, React Router, Framer Motion, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt (admin only) |
| Email | Nodemailer |

## Project Structure

```
barber/
├── client/          # React frontend (deploy to Vercel)
├── server/          # Express API (deploy to Render)
└── assets/          # Legacy static site (reference only)
```

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Supabase](https://supabase.com) free tier)

### 1. Database Setup

Create a Supabase project (or local Postgres), then copy the connection string.

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, SMTP credentials
```

Run migrations and seed data:

```bash
npm run db:setup
```

Default admin credentials (change in production):
- **Username:** `admin`
- **Password:** `admin123`

### 2. Start the API

```bash
cd server
npm run dev
```

API runs at `http://localhost:5000`

### 3. Start the Frontend

```bash
cd client
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Routes

| Route | Public | Admin |
|-------|--------|-------|
| `POST /api/auth/login` | ✓ | |
| `GET /api/products` | ✓ | |
| `POST /api/bookings` | ✓ | |
| `POST /api/orders` | ✓ | |
| `POST /api/contact` | ✓ | |
| `GET /api/gallery` | ✓ | |
| `GET /api/testimonials` | ✓ (approved) | |
| `POST /api/testimonials` | ✓ | |
| `GET /api/analytics` | | ✓ |
| All other mutations | | ✓ |

## Deployment

### Frontend → Vercel

1. Import the `client/` folder as a Vercel project
2. Set environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
3. Deploy

### Backend → Render

1. Create a **Web Service** pointing to `server/`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables from `server/.env.example`
5. Set `NODE_ENV=production` and `CLIENT_URL=https://your-app.vercel.app`

### Database → Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Connection string** (URI mode) to `DATABASE_URL`
3. Run `npm run db:setup` locally against the Supabase URL, or paste `server/db/schema.sql` + `seed.sql` in the SQL editor

### Email (Gmail SMTP)

1. Enable 2FA on your Gmail account
2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Set `SMTP_USER` and `SMTP_PASS` in server `.env`

## Admin Dashboard

Navigate to `/admin/login` and sign in with your admin credentials.

Manage:
- Products (CRUD)
- Bookings (view, confirm, cancel)
- Orders (view, update status)
- Gallery images
- Testimonials (approve/delete)
- Contact messages
- Analytics overview

## Pages

| Page | Path |
|------|------|
| Home | `/` |
| Services | `/services` |
| Shop | `/shop` |
| Gallery | `/gallery` |
| Book Appointment | `/book` |
| Place Order | `/order` |
| Contact | `/contact` |
| Admin | `/admin` |

## License

Private — Milestone Accessories © 2026
