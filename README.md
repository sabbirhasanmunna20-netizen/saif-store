# N AURA

A production-ready e-commerce web app built with **Next.js (App Router)**,
**Tailwind CSS**, and **MongoDB**. Includes phone+Gmail registration with
OTP verification, a mandatory ৳100 bKash advance-payment checkout flow with
Transaction ID verification, an admin dashboard for orders and product
CRUD, and WhatsApp support + automated payment alerts.

---

## 1. What's included

- **Storefront** — home page, product grid, product detail, cart, checkout.
- **Auth** — register (name, Gmail, phone, custom password) → OTP sent to
  phone → account created. Login checks password, then sends a login OTP
  as a second factor. Sessions are signed JWTs in an httpOnly cookie.
- **Checkout / bKash flow** — customer sends ৳100 to a fixed bKash number,
  submits the Transaction ID, the app checks it isn't a duplicate and
  stores the order as `pending`. A status page polls
  `/api/orders/:id` and shows "usually verified within 10–20 minutes."
- **Admin dashboard** (`/admin`, protected by middleware) — view every
  order with its payment status and TxnID, verify or reject payments, and
  a full CRUD screen for products.
- **WhatsApp** — floating support bubble linking to `wa.me/<number>`, plus
  a server-side alert (via the Meta WhatsApp Cloud API) sent automatically
  to the admin's WhatsApp whenever a new order/TxnID comes in and again
  when it's verified.

---

## 2. Folder structure

```
n-aura/
├── app/
│   ├── layout.js                     # Root layout (Header/Footer/WhatsApp bubble/CartProvider)
│   ├── globals.css
│   ├── page.js                       # Home page
│   ├── components/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── WhatsAppBubble.js
│   │   ├── ProductCard.js
│   │   └── CartProvider.js           # Client-side cart context
│   ├── products/
│   │   ├── page.js                   # Product grid
│   │   └── [id]/page.js              # Product detail
│   ├── cart/page.js
│   ├── checkout/page.js              # bKash instructions + TxnID form
│   ├── order-status/[id]/page.js     # 10–20 min status checker
│   ├── register/page.js
│   ├── login/page.js
│   ├── verify-otp/page.js
│   ├── admin/
│   │   ├── layout.js
│   │   ├── page.js                   # Orders dashboard (verify/reject)
│   │   └── products/page.js          # Product CRUD UI
│   └── api/
│       ├── auth/
│       │   ├── register/route.js
│       │   ├── send-otp/route.js
│       │   ├── verify-otp/route.js
│       │   ├── login/route.js
│       │   ├── logout/route.js
│       │   └── me/route.js
│       ├── products/route.js
│       ├── products/[id]/route.js
│       ├── orders/route.js
│       ├── orders/[id]/route.js
│       └── admin/orders/route.js
│           admin/orders/[id]/verify/route.js
│           admin/orders/[id]/reject/route.js
├── lib/
│   ├── mongodb.js                    # Cached Mongoose connection
│   ├── auth.js                       # JWT + bcrypt + cookie helpers
│   ├── otp.js                        # OTP generation + SMS sending
│   └── whatsapp.js                   # WhatsApp Cloud API alert sender
├── models/
│   ├── User.js
│   ├── Otp.js                        # TTL-indexed, auto-expires
│   ├── Product.js
│   └── Order.js
├── scripts/
│   └── seed-admin.js                 # Creates/promotes the first admin
├── middleware.js                     # Protects /admin and /api/admin
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── README.md
```

---

## 3. Local setup

### Prerequisites
- Node.js 18.17+ (Next.js 14 requirement)
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/atlas) free
  tier works fine
- (Optional but recommended for the real experience) a WhatsApp Cloud API
  app and an SMS gateway account — see section 5

### Steps

```bash
# 1. Clone your repo (after you've pushed this project — see section 4)
git clone https://github.com/<your-username>/n-aura.git
cd n-aura

# 2. Install dependencies
npm install

# 3. Copy the example env file and fill in real values
cp .env.example .env.local
# then edit .env.local in your editor

# 4. Create the first admin account
npm run seed:admin

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000`. Log in at `/login` with the admin
email/phone + password you set in `.env.local` to reach `/admin`.

---

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: N AURA e-commerce app"
git branch -M main
git remote add origin https://github.com/<your-username>/n-aura.git
git push -u origin main
```

`.env.local` is already excluded via `.gitignore` — never commit real
secrets. Only `.env.example` (with placeholder values) should be in the
repo.

---

## 5. Environment variables

Set these in `.env.local` for local dev, and again in **Vercel → Project
Settings → Environment Variables** for production. See `.env.example` for
the full annotated list. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas (or self-hosted) connection string |
| `JWT_SECRET` | Yes | Long random string used to sign session cookies |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD` | Yes (for seeding) | First admin account, used by `npm run seed:admin` |
| `BKASH_RECEIVE_NUMBER` | Yes | The bKash number shown at checkout (`01516557161`) |
| `ADVANCE_PAYMENT_AMOUNT` | Yes | Advance payment amount in Taka (default `100`) |
| `ADMIN_WHATSAPP_NUMBER` | Yes | Number that receives order/verification alerts (`8801516557161`) |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Optional | Meta WhatsApp Cloud API credentials for automated alerts |
| `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER_ID` | Optional | SMS gateway for real OTP delivery |

**Without `WHATSAPP_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`**, alerts are simply
logged to the server console instead of sent — useful for testing, but
configure real credentials before launch.

**Without `SMS_API_URL`/`SMS_API_KEY`**, OTP codes are logged to the
server console (visible in your terminal locally, or in Vercel's Function
Logs in production) instead of being texted — again, fine for testing,
not for real customers.

### Setting up WhatsApp Cloud API (for automated alerts)
1. Create a Meta developer app at https://developers.facebook.com/apps
2. Add the "WhatsApp" product to it.
3. From the WhatsApp > API Setup page, grab the **temporary access token**
   (or generate a permanent one via a System User for production) and the
   **Phone Number ID**.
4. Add a recipient test number (or verify your business number) and set
   `ADMIN_WHATSAPP_NUMBER` to that number, digits only with country code
   (e.g. `8801516557161`).

### Setting up an SMS gateway (for OTP)
Any gateway that accepts a simple REST POST works — for Bangladesh,
providers like BulkSMSBD, Grameenphone SMS API, or similar are common.
Update `lib/otp.js` if your provider's request/response shape differs
from the generic example there.

---

## 6. Deploy to Vercel

### Option A — 1-click from GitHub
1. Push the repo to GitHub (section 4).
2. Go to https://vercel.com/new and import the `n-aura` repository.
3. Vercel auto-detects Next.js — leave build settings as default
   (`npm run build`, output directory auto-detected).
4. Under **Environment Variables**, add every variable from
   `.env.example` with your real values (same table as above).
5. Click **Deploy**.
6. Once deployed, run the admin seed script **once** against your
   production database (from your local machine, pointed at the same
   `MONGODB_URI` you set in Vercel):
   ```bash
   npm run seed:admin
   ```
7. Visit your Vercel URL, log in at `/login` with the admin credentials,
   and you're live.

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel login
vercel        # first deploy, follow prompts, link to a new project
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
# ...repeat for each variable in .env.example...
vercel --prod
```

### Notes for production
- Use a strong, unique `JWT_SECRET` (e.g. `openssl rand -hex 32`).
- Restrict your MongoDB Atlas network access to Vercel's IP ranges or use
  "Allow access from anywhere" only if you understand the tradeoff.
- Rotate `WHATSAPP_TOKEN` before it expires if you're using a temporary
  token; switch to a permanent System User token for real launches.

---

## 7. How the core flows work

**Registration → OTP → password**
`POST /api/auth/register` validates the input, hashes the password, and
stores a *pending* registration + hashed OTP in the `Otp` collection
(auto-expires via a MongoDB TTL index). `POST /api/auth/verify-otp` with
`purpose: "register"` checks the code and only then creates the real
`User` document.

**Login → password → OTP → session**
`POST /api/auth/login` checks the password first, then sends a fresh OTP
and returns the phone number. The client redirects to `/verify-otp`,
which calls `POST /api/auth/verify-otp` with `purpose: "login"` — on
success a signed JWT is set as an httpOnly cookie.

**Checkout → bKash TxnID → verification**
`POST /api/orders` requires customer details, cart items, and a
`bkashTxnId`. It rejects duplicate TxnIDs (unique index + explicit
pre-check) and creates the order as `pending`, then fires a WhatsApp
alert to the admin with the TxnID. The customer is redirected to
`/order-status/[id]`, which polls `GET /api/orders/:id` every 15 seconds.

**Admin verification → WhatsApp alert**
From `/admin`, clicking **Verify** calls
`PATCH /api/admin/orders/:id/verify`, which flips the order to
`verified` and sends a confirmation WhatsApp message. **Reject** works
the same way via `/reject`.

---

## 8. Customization checklist

- [ ] Replace the "N" text logo in `app/components/Header.js` with a real
      logo (`/public/logo.svg`).
- [ ] Adjust brand colors in `tailwind.config.js` (`aura.gold`, etc).
- [ ] Wire `lib/otp.js` to your actual SMS provider's API shape.
- [ ] Confirm `BKASH_RECEIVE_NUMBER` / `ADMIN_WHATSAPP_NUMBER` match your
      real bKash and WhatsApp numbers.
- [ ] Add product images (`imageUrl` field) via the admin panel — file
      uploads aren't included by default; use an external image host or
      extend `models/Product.js` + the admin form to support uploads
      (e.g. via Cloudinary or Vercel Blob).
