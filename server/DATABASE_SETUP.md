# Making the database persistent (free)

Right now the server uses a throwaway **in-memory MongoDB** — every restart wipes all
data (services, photos, orders, accounts). This guide switches it to a **free, permanent
MongoDB Atlas** database. Uploaded photos are stored in the database, so they persist too.

**Time:** ~10 minutes, one time. **Cost:** free (Atlas M0 tier).

---

## 1. Create a free Atlas cluster

1. Go to <https://www.mongodb.com/atlas> and sign up (or log in).
2. **Create a deployment** → choose the free **M0** tier.
3. Pick a cloud provider and a **region near your users** (for Australia: AWS `ap-southeast-2` Sydney).
4. Name the cluster (e.g. `brilliance-care`) and create it. Wait ~1–3 min for it to provision.

## 2. Create a database user

1. Left sidebar → **Database Access** → **Add New Database User**.
2. Choose **Password** auth. Set a username (e.g. `brilliance_app`) and a strong password.
   **Copy the password somewhere safe** — you'll need it in step 4.
3. Give it the **Read and write to any database** role. Add the user.

> If the password has special characters like `@ : / ? # [ ]`, URL-encode them in the
> connection string (e.g. `@` → `%40`), or just use a password with only letters/numbers.

## 3. Allow network access

1. Left sidebar → **Network Access** → **Add IP Address**.
2. For first setup you can click **Allow access from anywhere** (`0.0.0.0/0`).
   Tighten this to your server's real IP before going live (see "Before you go live").

## 4. Get the connection string

1. Cluster view → **Connect** → **Drivers** (Node.js).
2. Copy the string. It looks like:

   ```
   mongodb+srv://brilliance_app:<password>@brilliance-care.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. Replace `<password>` with the real password from step 2, and insert the database name
   **`brilliance_care`** right before the `?`:

   ```
   mongodb+srv://brilliance_app:YOURPASSWORD@brilliance-care.xxxxx.mongodb.net/brilliance_care?retryWrites=true&w=majority
   ```

## 5. Point the app at it

Open **`server/.env`** and change these two lines:

```
USE_MEMORY_DB=false
MONGODB_URI=mongodb+srv://brilliance_app:YOURPASSWORD@brilliance-care.xxxxx.mongodb.net/brilliance_care?retryWrites=true&w=majority
```

Save, then restart the server (`npm run dev` or `npm start` in `server/`).

## 6. Verify it worked

Watch the startup log:

- ✅ Good — persistent: `✅ MongoDB connected: brilliance-care.xxxxx.mongodb.net/brilliance_care`
- ❌ Still in-memory: `✅ In-memory MongoDB started` or `⚠️ Falling back to an in-memory database`
  → the connection string, user, or Network Access is wrong (see Troubleshooting).

Final proof: log into `/admin/services`, add a service with a photo, **restart the server**,
and refresh — it should still be there.

> On the very first connection to the empty Atlas database, the app seeds a demo catalogue
> (sample laundry/cleaning services + products). Your client can edit or delete those from
> the admin area; their changes now stick across restarts.

---

## Troubleshooting

- **Log says it fell back to in-memory** — in development the app still boots when Atlas is
  unreachable, so a bad string looks survivable. Re-check: password correct & URL-encoded, DB
  user has read/write, Network Access includes your IP (or `0.0.0.0/0`), and the string has no
  leftover `<...>`. Set `ALLOW_MEMORY_FALLBACK=false` in `server/.env` to make a bad connection
  a hard failure locally too, which is the quickest way to see the real error.
- **`querySrv ENOTFOUND` / DNS errors** — the `mongodb+srv` host is mistyped, or the network
  blocks SRV DNS. Copy the string fresh from Atlas → Connect.
- **Auth failed** — wrong username/password, or special characters not URL-encoded.
- **Times out on a cluster that works elsewhere** — an idle M0 can take a while to accept its
  first connection. Raise `DB_SERVER_SELECTION_TIMEOUT_MS` (default 15000).

> With `NODE_ENV=production` there is no fallback: if Atlas is unreachable the server refuses
> to start. That is deliberate — booting on a throwaway database would mean taking real
> customer orders and losing them on the next restart.

## Before you go live (production checklist)

Set `NODE_ENV=production`. The server then **refuses to start** unless the following are set to
real values, so you cannot accidentally ship the demo credentials:

- `JWT_SECRET` → a long random string (32+ chars).
  Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` → the real admin login (demo defaults are `admin@gmail.com` / `123`).
- `MONGODB_URI` → the Atlas string, with `USE_MEMORY_DB=false`.

Also:

- Tighten Atlas **Network Access** from `0.0.0.0/0` to your hosting provider's IP.
- **Keep `.env` out of git.** `.gitignore` lists it, but that only affects *untracked* files —
  `server/.env` and `client/.env` were already committed, so run this once, before you put the
  Atlas password in them:

  ```
  git rm --cached server/.env client/.env
  git commit -m "Stop tracking .env files"
  ```

  (`--cached` leaves the files on disk; it only removes them from git.)
- Set your real secrets in the host's environment-variable settings (Render, Railway, Fly…)
  rather than in a committed file.
