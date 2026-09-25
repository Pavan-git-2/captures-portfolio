# Video & Image Portfolio Website — Setup Guide

ఇది ఒక పూర్తి, పనిచేసే వెబ్‌సైట్. దీన్ని live చేయడానికి 3 steps: Supabase (backend), Vercel/Netlify (hosting), Domain (optional, paid).

**మొత్తం ఖర్చు: ₹0** — Custom domain లేకుండా, Vercel ఉచితంగా ఇచ్చే `.vercel.app` URL వాడుతున్నాం కాబట్టి, ఏమీ కొనాల్సిన అవసరం లేదు.

---

## Step 1 — Supabase Project create చేయండి (Database + Auth + Storage)

1. https://supabase.com → **Start your project** → GitHub/Google తో సైన్ అప్ చేయండి (free).
2. **New Project** → పేరు పెట్టి, region ఎంచుకోండి (India → Singapore or Mumbai ఉంటే అది), database password సెట్ చేయండి, **Create**.
3. Project తయారవగానే, ఎడమవైపు **Project Settings → API** కి వెళ్ళండి. అక్కడ కనిపించే:
   - **Project URL**
   - **anon public key**

   వీటిని కాపీ చేసి, `assets/supabase-client.js` ఫైల్‌లో ఇలా పేస్ట్ చేయండి:
   ```js
   const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

### 1a — Database table create చేయండి

Supabase dashboard → **SQL Editor** → **New query** → కింద ఉన్న SQL మొత్తం paste చేసి **Run** నొక్కండి:

```sql
create table media (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('image', 'video')) not null,
  category text check (category in ('recent_works', 'social_media_reels', 'ae_works', 'pr_works')) not null,
  title text,
  description text,
  url text not null,
  created_at timestamptz default now()
);

alter table media enable row level security;

-- Public (customers) can only VIEW
create policy "Public can view" on media
  for select using (true);

-- Only logged-in admin can add/edit/delete
create policy "Admin can insert" on media
  for insert with check (auth.role() = 'authenticated');

create policy "Admin can update" on media
  for update using (auth.role() = 'authenticated');

create policy "Admin can delete" on media
  for delete using (auth.role() = 'authenticated');
```

### 1b — Storage buckets create చేయండి (images & videos)

Dashboard → **Storage** → **New bucket**:
- పేరు: `images` → **Public bucket** toggle ఆన్ చేయండి → Create
- పేరు: `videos` → **Public bucket** toggle ఆన్ చేయండి → Create

తర్వాత ప్రతి bucket లోపల → **Policies** → **New policy** → కింద ఉన్న రెండు policies add చేయండి (each bucket కి):

```sql
-- Anyone can view files (public gallery)
create policy "Public read" on storage.objects
  for select using (bucket_id = 'images' or bucket_id = 'videos');

-- Only logged-in admin can upload/edit/delete
create policy "Admin write" on storage.objects
  for insert with check (auth.role() = 'authenticated');

create policy "Admin update" on storage.objects
  for update using (auth.role() = 'authenticated');

create policy "Admin delete" on storage.objects
  for delete using (auth.role() = 'authenticated');
```
(ఇవి కూడా SQL Editor లో run చేసుకోవచ్చు.)

### 1c — Client కోసం Admin login create చేయండి

Dashboard → **Authentication → Users → Add user** → Client email + password ఎంటర్ చేయండి → **Auto Confirm User** ఆన్ చేయండి → Create.

ఈ email/password తోనే client `login.html` లో లాగిన్ అవుతారు.

---

## Step 2 — Local గా టెస్ట్ చేయండి

ఏ code editor అయినా (VS Code) ఈ ఫోల్డర్ ఓపెన్ చేసి, **Live Server** extension తో `index.html` రన్ చేయండి. లేదా నేరుగా Step 3 కి వెళ్ళి డిప్లాయ్ చేసి టెస్ట్ చేయవచ్చు.

---

## Step 3 — GitHub కి push చేయండి

1. https://github.com → New repository → పేరు పెట్టండి (ఉదా: `portfolio-website`) → Create (public లేదా private, రెండూ ఉచితమే).
2. టెర్మినల్ లో ఈ ఫోల్డర్ లోపలికి వెళ్ళి:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git
   git push -u origin main
   ```
   (Terminal అలవాటు లేకపోతే, **GitHub Desktop** app వాడి ఫోల్డర్‌ని డ్రాగ్ & డ్రాప్ చేసి push చేయొచ్చు.)

## Step 4 — Vercel లో Deploy చేయండి (ఉచితం, Domain అవసరం లేదు)

1. https://vercel.com → **GitHub** తో సైన్ అప్ చేయండి.
2. **Add New → Project** → మీరు ఇప్పుడే push చేసిన `portfolio-website` repo ఎంచుకోండి.
3. Framework: **Other** ఎంచుకోండి. Build command ఖాళీగా వదిలేయండి — ఇది plain HTML/CSS/JS, build అవసరం లేదు.
4. **Deploy** నొక్కండి. కొన్ని సెకన్లలో Vercel ఇచ్చే ఉచిత URL వస్తుంది:
   ```
   https://portfolio-website-yourname.vercel.app
   ```
   ఇదే మీ **public website link** — ఇది free, SSL (https) automatic గా వస్తుంది, మరియు 0 budget కి సరిపోతుంది. Custom domain ఇప్పుడు అవసరం లేదు — భవిష్యత్తులో కావాలంటే, Vercel project → Settings → Domains లో ఎప్పుడైనా add చేసుకోవచ్చు.
5. తర్వాత ఎప్పుడైనా code మార్చినా, `git push` చేస్తే చాలు — Vercel automatic గా re-deploy చేస్తుంది.

---

## వెబ్‌సైట్ ఎలా వాడాలి

- **Customers**: `yourdomain.com` ఓపెన్ చేస్తే నేరుగా gallery కనిపిస్తుంది — login అవసరం లేదు.
- **Client (Admin)**: `yourdomain.com/login.html` కి వెళ్ళి, Step 1c లో సెట్ చేసిన email/password తో లాగిన్ అవ్వాలి → Dashboard లో upload/edit/delete చేయవచ్చు.

---

## Client కి Ownership Handover చేయడం

పూర్తయిన తర్వాత, పూర్తి control clientకి ఇవ్వడానికి:

1. **Supabase**: Project Settings → Team → client email ని **Owner** గా add చేయండి, తర్వాత మిమ్మల్ని remove చేసుకోండి (లేదా వారి own account కి transfer చేయండి — Supabase support ద్వారా org transfer చేయవచ్చు).
2. **Vercel**: Project Settings → Members → client ని add చేసి Transfer Ownership చేయండి, లేదా వారి own Vercel account కి project transfer చేయండి.
3. **GitHub repo**: repo Settings → Transfer ownership → client username. (ఇది Vercel కి కూడా connect అయ్యి ఉంటుంది కాబట్టి, transfer చేసేటప్పుడు Vercel access కూడా చెక్ చేయండి.)
4. ఈ code folder మొత్తం (లేదా GitHub repo link) client కి ఇవ్వండి.
5. భవిష్యత్తులో client custom domain కావాలంటే, వారే ఒక domain కొని Vercel project లో Settings → Domains లో add చేసుకోవచ్చు — ఎలాంటి code మార్పు అవసరం లేదు.

---

## గమనికలు

- Supabase free tier: 1 GB storage, 2 GB bandwidth/month, 500 MB database — ఒక చిన్న-మధ్యస్థ portfolio కి సరిపోతుంది. వీడియోలు ఎక్కువ/పెద్దవి అయితే, storage పెరగాల్సి రావొచ్చు (paid tier, ~$25/month) లేదా వీడియోలను YouTube/Vimeo (unlisted) లో పెట్టి, ఆ లింక్‌ని ఇక్కడ `url` గా వాడొచ్చు — ఇది bandwidth ఖర్చు తగ్గిస్తుంది.
- ఈ site కేవలం ఒక్క admin account కోసమే design చేయబడింది (client మాత్రమే). ఎక్కువ మంది admins కావాలంటే చెప్పండి, easy గా add చేయొచ్చు.
