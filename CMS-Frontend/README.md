# 🛍️ ShopNear — Customer Frontend

A production-grade **React + Vite + Tailwind CSS** customer-facing app for a multi-shop ordering platform.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | JWT login / signup with auto-restore |
| 📍 Geolocation | Detect user location → fetch nearby shops |
| 🏪 Shops | Browse, search, filter, sort shops |
| 📦 Products | Grid view, search, category filter |
| 🛒 Cart | Add/remove/update, localStorage persistence |
| 🧾 Checkout | 3-step: Address → Payment → Confirm |
| 💳 Payment | UPI / Card / COD with status polling |
| 📋 Orders | History, status filter, live tracking |
| ⭐ Feedback | Rate & review delivered orders |
| 👤 Profile | Edit info & change password |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL to point at your backend

# 3. Start dev server
npm run dev
```

App runs at **http://localhost:3000**

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Button, Input, Loader, Modal, Badge
│   └── layout/          # Navbar, Footer
├── context/             # AuthContext, CartContext
├── hooks/               # useAuth, useCart, useFetch
├── pages/
│   ├── Auth/            # Login, Signup
│   ├── Cart/            # Cart, Checkout
│   ├── Home/            # Landing page
│   ├── Orders/          # Orders list, OrderDetail
│   ├── Payment/         # Payment gateway page
│   ├── Products/        # Products grid, ProductCard
│   ├── Profile/         # User profile & settings
│   └── Shops/           # NearbyShops, ShopDetails
├── routes/              # AppRoutes (protected + guest routes)
├── services/            # api.js, authService, shopService, orderService
└── utils/               # constants.js, helpers.js
```

---

## 🔗 API Integration

The app connects to your Node.js + Salesforce backend via `VITE_API_URL`.

### Expected endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register customer |
| POST | `/auth/login` | Login → returns JWT |
| GET  | `/auth/profile` | Get own profile |
| PUT  | `/auth/profile` | Update profile |
| PUT  | `/auth/change-password` | Change password |
| GET  | `/shops/nearby?lat&lng&radius` | Nearby shops |
| GET  | `/shops` | All shops |
| GET  | `/shops/:id` | Shop detail |
| GET  | `/shops/:id/products` | Shop products |
| GET  | `/shops/:id/reviews` | Shop reviews |
| POST | `/shops/:id/reviews` | Submit review |
| POST | `/orders` | Place order |
| GET  | `/orders/my` | My orders |
| GET  | `/orders/:id` | Order detail |
| PUT  | `/orders/:id/cancel` | Cancel order |
| POST | `/payments/initiate` | Start payment |
| POST | `/payments/verify` | Verify payment |
| GET  | `/payments/status/:orderId` | Payment status |
| POST | `/orders/:id/feedback` | Submit feedback |

---

## 🎨 Design System

- **Fonts**: Syne (display) + DM Sans (body) + JetBrains Mono (numbers)
- **Accent**: Orange `#f97316` on dark `#0f0f0f` background
- **Components**: `btn-primary`, `btn-secondary`, `card`, `input-field`, `badge-*`
- **Animations**: `fade-in`, `slide-up`, `scale-in` — all CSS-only

---

## 🔐 Protected Routes

Routes requiring authentication: `/cart`, `/checkout`, `/payment`, `/orders`, `/orders/:id`, `/profile`

Unauthenticated users are redirected to `/login` with the return path stored in `location.state.from`.

---

## 🏗️ Build for Production

```bash
npm run build
# Output in /dist — deploy to Vercel, Netlify, or your server
```
