# Chikote & Muchimba — Wedding Invitation

A personalized digital wedding invitation. Each guest gets their own link
(`/invite/CODE`) with their name, an RSVP form, a gift-preference note, and a
wishes/guestbook. An admin dashboard at `/admin` is used to create guests,
send links, track RSVPs, and moderate wishes.

- **Wedding:** Chikote Gift Sikelete & Muchimba Lugwalo, 20 December 2026
- **Stack:** React 19 + TypeScript + Vite, Supabase (Postgres + Auth + RLS), no other backend
- **Theme:** Champagne Gold / Olive Green / Black

---

## 1. What's still needed from the wedding administrator

The site works end-to-end right now with tasteful placeholders. Before the
big day, someone should supply:

1. **The wedding song** — an MP3 file dropped at `public/assets/music/wedding-song.mp3`
   (see §7 below). Until then, the music button simply stays hidden.
2. **Mobile Money details** — provider name, number, and account name, set in
   `src/config/wedding.ts` under `gifts.mobileMoney` (see §8). Until then, the
   gift page tells guests this is "to be added."
3. **Google Maps links** for the church and the reception venue — set
   `mapUrl` / `directionsUrl` for each venue in `src/config/wedding.ts` (see
   §9). Until then, the programme still shows the venue names and times, just
   without map links.
4. **Photos** (optional) — a hero couple photo and gallery photos. Until
   supplied, the hero shows an elegant "C & M" monogram and the gallery shows
   six placeholder cards (see §10).
5. **The first administrator account** — an email + password to sign in to
   `/admin` (see §5). Nobody can use the dashboard until this exists.

Everything else — database, RSVP flow, gift preferences, wishes moderation,
guest codes, WhatsApp sending — is complete and tested.

---

## 2. Project layout

```
supabase/migrations/   SQL migrations (run in order against your Supabase project)
src/config/wedding.ts  Single source of truth for all wedding details
src/lib/                Small framework-free helpers (dates, maps, phone, errors, types)
src/services/           Thin wrappers around Supabase calls (one file per feature)
src/components/         Shared visual pieces (SVG ornaments, full-screen message)
src/music/              The single persistent <audio> element + its floating button
src/invitation/         The guest-facing invitation, section by section
src/admin/               The admin dashboard (code-split, guests never download it)
src/styles/              tokens.css (design tokens), invitation.css, admin.css
```

Nothing is hard-coded twice: every date, name, venue, and colour a guest sees
traces back to `src/config/wedding.ts` (optionally overridden per-row by the
`wedding_settings` table, for changes without a redeploy).

---

## 3. Database

Three migrations, applied in order, against a Supabase Postgres database:

| File | What it does |
|---|---|
| `001_schema.sql` | Tables: `admins`, `guests`, `gift_contributions`, `wishes`, `wedding_settings`. Auto-generates each guest's 6-character invitation code (ambiguous characters like `0/O/1/I` excluded), normalises names, builds `display_name` when left blank. |
| `002_guest_functions.sql` | The **only** way an anonymous guest touches the database: `get_invitation`, `mark_opened`, `submit_rsvp`, `submit_gift`, `submit_wish`, `get_public_wishes`. Every one validates its input and only returns/affects that one guest's row. |
| `003_security.sql` | Row Level Security on every table. Anonymous visitors have **zero** direct table access — only the guest functions above, which are `SECURITY DEFINER` and scoped to a single invitation code. Admins (rows in the `admins` table, matched to a Supabase Auth user) can read and write everything through the normal table API. |

### Running the migrations

In the Supabase dashboard: **SQL Editor → New query**, paste each file's
contents in order (001, then 002, then 003), and run it. Or, with the
Supabase CLI:

```bash
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

All three migrations were tested against a local Postgres instance
(guest-permission checks, RSVP idempotency, gift/wish validation, wish
moderation visibility, code immutability, soft-delete behaviour) before being
written here.

---

## 4. Environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY        # the "anon" / "publishable" key — never the service_role key
VITE_SITE_URL=https://your-domain.com        # no trailing slash; used to build invite links
```

The anon key is safe to expose in the browser — Row Level Security is what
actually protects the data, not the secrecy of this key.

---

## 5. Creating the first administrator

The `admins` table is what grants dashboard access — being able to sign in to
Supabase Auth is **not** enough by itself. To create the first admin:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**,
   and create the administrator's email + password (or send them a magic
   invite, whichever you prefer).
2. Copy that user's UUID (shown in the users list).
3. In **SQL Editor**, run:
   ```sql
   insert into public.admins (user_id) values ('paste-the-uuid-here');
   ```
4. That person can now sign in at `/admin/login`.

Repeat step 1–3 for any additional administrators (e.g. both families).

---

## 6. Running locally

```bash
npm install
cp .env.example .env   # fill in your Supabase project's values
npm run dev
```

Open the printed local URL. Visit `/admin/login` for the dashboard, or
`/invite/CODE` for a guest view (create a guest first, from the dashboard, to
get a real code).

`npm run build` type-checks the whole project (`tsc --noEmit`) and then
produces a production build in `dist/`. `npm run preview` serves that build
locally.

---

## 7. Adding the wedding song

Drop the audio file at:

```
public/assets/music/wedding-song.mp3
```

That's it — no code changes needed. The music only starts when a guest taps
"Open Invitation" (required by browsers' autoplay rules), and the floating
play/pause button hides itself automatically if the file isn't there yet, so
there's nothing to break in the meantime.

---

## 8. Adding Mobile Money details

Open `src/config/wedding.ts` and fill in the `gifts.mobileMoney` block:

```ts
mobileMoney: {
  provider: 'MTN Mobile Money',   // or Airtel Money, Zamtel Kwacha, etc.
  number: '0977 000 000',
  accountName: 'Chikote Sikelete',
  instructions: '',                // optional extra note shown to guests
}
```

Once any of these are filled in, the "Send via Mobile Money" panel on the
invitation switches from its "to be added" placeholder to the real details,
with a copy-number button.

---

## 9. Adding the map links

Also in `src/config/wedding.ts`, each venue (`church` and `reception`) accepts
`mapUrl` and `directionsUrl`. Paste the "Share → Copy link" URL from Google
Maps for each. Until they're set, the programme still shows the venue name,
address text, and time — it just won't show "View location" / "Get
directions" links.

---

## 10. Adding photos

- **Hero photo:** set `heroPhoto` in `src/config/wedding.ts` to an image path
  under `public/`. Until then, the oval frame shows a "C & M" monogram.
- **Gallery photos:** add entries to `gallery.photos` in the same file (an
  array of `{ src, alt }`). Until then, the gallery shows six elegant
  placeholder cards reading "Photo to be added."

---

## 11. How the guest flow works

1. Admin creates a guest in the dashboard → a unique code is generated →
   admin copies the link or sends it via WhatsApp (pre-filled message).
2. Guest opens `/invite/THEIRCODE` → sees a closed gate with the couple's
   names → taps "Open Invitation" → the gate opens, music starts (if
   available), and the invitation is marked "opened."
3. Guest scrolls through hero, greeting, countdown, programme, dress code,
   gallery, RSVP, gift preference, and wishes.
4. RSVP and gift preference can be changed later (guest just reopens their
   link). Wishes are limited to 3 per guest and stay hidden until an admin
   approves them.
5. Nothing here processes real payments — "gift preference" is only ever a
   note of *how* a guest intends to give, for the couple's own records.

## 12. How the admin flow works

- **Dashboard:** at-a-glance stats, plus a standing reminder of anyone who
  said they'll bring money in person (so it's never a surprise on the day).
- **Guests:** search, add, edit, deactivate (soft-delete, reversible), or
  permanently delete a guest; copy their link or send it via WhatsApp; mark
  an invitation as sent.
- **RSVPs:** filterable list with attendee counts and reply times.
- **Gifts:** split by Mobile Money vs. Bring-to-wedding, with per-guest
  amount/phone/reference where applicable, and a "Mark received" toggle.
- **Wishes:** approve, reject, or delete each submitted message; only
  approved ones ever appear on the public invitation.

---

## 13. Deploying

The build is a static site — deploy `dist/` anywhere that serves static
files with SPA fallback (any route should serve `index.html`).

- **Vercel:** `vercel.json` is already set up (SPA rewrite + asset caching).
  Just import the repo and set the three environment variables in the
  Vercel dashboard.
- **Netlify:** `public/_redirects` is already set up the same way.

Either way, remember to set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
and `VITE_SITE_URL` as environment variables on the hosting platform, not
just in a local `.env` file.

---

## 14. Testing notes

- All three SQL migrations were exercised against a local Postgres instance
  covering: guest creation/code generation, permission boundaries (anon vs.
  admin), RSVP validation and idempotency, gift validation and locking,
  wish validation/limits/moderation visibility, soft-delete behaviour, and
  invitation-code immutability.
- `npm run build` (which runs a full, strict `tsc --noEmit` before bundling)
  completes with no errors.
- The build was smoke-tested headlessly at a mobile viewport: the landing
  page, an invitation with an invalid/unset database, and the admin
  "not configured" state all render correctly with the intended
  champagne/gold/olive/black theme, damask background, and ornament work.
- Full interactive testing (RSVP submission, wish moderation, WhatsApp
  sending, etc.) needs a real Supabase project connected, since it depends
  on live data — recommended before sending real invitations: create one
  test guest, walk through opening the link, submitting an RSVP, a gift
  preference, and a wish, then approve that wish from the dashboard and
  confirm it appears on the invitation.
