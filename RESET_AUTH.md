# Complete Auth Reset Instructions

Follow these steps **exactly** to fix the magic link issue:

## Step 1: Stop Everything

```bash
# Stop Next.js dev server (Ctrl+C in that terminal)
# Then stop Supabase:
npm run supabase:stop
```

## Step 2: Clear Browser Data

**IMPORTANT**: Clear ALL browser data for localhost:

1. Open Chrome/Edge DevTools (F12)
2. Go to **Application** tab
3. Under **Storage**:
   - Click "Clear site data"
   - Make sure ALL checkboxes are checked
4. Close all browser tabs/windows for localhost

## Step 3: Restart Supabase

```bash
npm run supabase:start
```

Wait for it to fully start (you'll see the URLs listed).

## Step 4: Start Next.js

```bash
npm run dev
```

## Step 5: Access Via Localhost (CRITICAL!)

Open a **NEW incognito/private window** and go to:

```
http://localhost:3000
```

**DO NOT** use `http://127.0.0.1:3000`

## Step 6: Test Login

1. Enter `dev1@example.com`
2. Click "Send Magic Link"
3. Open Mailpit: http://127.0.0.1:54324
4. Click the email to open it
5. **CHECK the magic link URL** - it should be:

   ```
   http://localhost:3000/auth/callback?token_hash=...&type=magiclink
   ```

   **NOT**: `http://127.0.0.1:54321/auth/v1/verify?...`

6. Click the magic link

## What Should Happen

✅ The magic link should redirect to `http://localhost:3000/auth/callback`
✅ You should see "Connexion en cours..." (Loading)
✅ You should be redirected to `/calendar`
✅ You should be logged in as "Alice Developer"

## If It Still Doesn't Work

If you still see the old URL format or errors, run:

```bash
# Nuclear option - full reset
npm run supabase:stop
npm run supabase:reset  # This resets the database
npm run dev
```

Then repeat Step 5-6 above.

## Debugging

If you want to see what's happening:

1. Open DevTools Console (F12)
2. Go to Network tab
3. Try the login flow
4. Look for any errors in the console
5. Check the magic link URL in Mailpit BEFORE clicking it

---

**The key issue**: Old magic links have the wrong redirect URL cached. You MUST generate a new one after the config changes.
