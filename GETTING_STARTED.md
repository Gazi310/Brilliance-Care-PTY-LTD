# Brilliance Care — Products Shop + Admin

A full‑stack product store wired into the existing site. Clicking the **Products** tab
on the home page opens an animated shop. An **admin** (admin@gmail.com / 123) can log in
and control how much of each product is in stock.

## Run it (two terminals)

### 1. Backend  (`/server`)
```bash
cd server
npm install
npm run dev          # http://localhost:5000
```
The server boots a **zero‑setup in‑memory MongoDB** by default and seeds 12 products plus
the admin account. (First run downloads a small MongoDB binary, so allow a minute.)

### 2. Frontend  (`/client`)
```bash
cd client
npm install          # already installed if you ran it before
npm run dev          # http://localhost:5173
```
Open the site, click the **Products** tab.

## Admin
- Click **Admin Login** (top‑right of the Products page).
- Sign in with **admin@gmail.com / 123**.
- The **Inventory Control** panel lets you set stock quantity, price and availability per
  product, add new products, or remove them. Changes save to the database instantly.

## Using a real, persistent database
The in‑memory DB resets when the server stops. For permanent storage, edit `server/.env`:
```env
USE_MEMORY_DB=false
MONGODB_URI=mongodb://127.0.0.1:27017/brilliance_care   # or your MongoDB Atlas URI
```
Then `npm run seed` (once) and `npm run dev`.

## How it fits together
- **Frontend** (`client/src`): `pages/Products.jsx` + `components/products/*`, with
  `context/AuthContext` (login/JWT) and `context/CartContext` (cart, saved to the browser).
- **Backend** (`server`): Express + Mongoose REST API — `GET /api/products`,
  `POST /api/orders` (checkout, decrements stock), admin‑only product CRUD, and
  `POST /api/auth/login` (JWT). Admin routes are protected by JWT + an `isAdmin` check.
