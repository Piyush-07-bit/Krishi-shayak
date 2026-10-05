# Chat Room Database Setup (Supabase)

Follow these steps to create the database table, storage bucket, and realtime config used by `ChatRoomPage`.

Prerequisites
- Environment variables set in your Vite app: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- You are logged in to your Supabase project

## 1) Create `messages` table

Run this SQL in Supabase SQL editor.

```
-- Enable UUID generation (if not already enabled)
create extension if not exists pgcrypto;

-- Chat messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  username text not null,
  region text not null default 'Global',
  content text not null,
  audio_url text,
  created_at timestamptz not null default now()
);

-- Index for efficient ordering by time
create index if not exists idx_messages_created_at on public.messages (created_at);

-- Enable RLS and add basic policies
alter table public.messages enable row level security;

-- Anyone authenticated can read all messages
create policy if not exists "Read messages (authenticated)"
  on public.messages
  for select
  to authenticated
  using (true);

-- Only logged-in user can insert messages on their own behalf
create policy if not exists "Insert own messages"
  on public.messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);
```

Notes
- The frontend always writes `region` as `Global`.
- Update/DELETE policies are not needed for the current UI, but you can add owner-based ones if you later add edit/delete features.

## 2) Enable Realtime on `messages`

Option A (SQL):
```
alter publication supabase_realtime add table public.messages;
```

Option B (Dashboard): Database → Replication → Configure `supabase_realtime` → Add table `public.messages`.

## 3) Create storage bucket for voice messages

Run this SQL to create a public bucket and allow uploads from authenticated users.

```
-- Create bucket (public read)
select storage.create_bucket('voice-messages', public => true);

-- Storage policies for the bucket
-- Allow anyone to read public files in this bucket
create policy if not exists "Public read (voice-messages)"
  on storage.objects
  for select
  to public
  using (bucket_id = 'voice-messages');

-- Allow authenticated users to upload files into this bucket
create policy if not exists "Authenticated upload (voice-messages)"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'voice-messages');
```

Optional hardening
- If you want to restrict uploads to a per-user folder structure (the app writes to `voice/<user-id>/...`), replace the insert policy with:
```
create policy if not exists "User folder upload (voice-messages)"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'voice-messages'
    and position((auth.uid())::text in name) > 0
  );
```

## 4) (Optional) Users profile table/bucket

The registration flow writes to a `users` table and optionally uploads a `profile-photos` object. If you haven’t created them yet:

```
create table if not exists public.users (
  id uuid primary key,
  fullName text,
  phone text,
  email text,
  city text,
  state text,
  profilePhoto text,
  createdAt timestamptz default now()
);

create index if not exists idx_users_created_at on public.users (createdAt);

alter table public.users enable row level security;

create policy if not exists "Read users (authenticated)"
  on public.users for select to authenticated using (true);

create policy if not exists "Insert self (users)"
  on public.users for insert to authenticated with check (auth.uid() = id);

create policy if not exists "Update self (users)"
  on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Optional profile photos bucket
select storage.create_bucket('profile-photos', public => true);

create policy if not exists "Public read (profile-photos)"
  on storage.objects for select to public using (bucket_id = 'profile-photos');

create policy if not exists "Authenticated upload (profile-photos)"
  on storage.objects for insert to authenticated with check (bucket_id = 'profile-photos');
```

## 5) Verify
- Insert a test row into `messages` and confirm it appears in the Realtime stream
- Upload an audio file into `voice-messages` and confirm it loads publicly
- Load the app, sign in, and open `/chat-room`

If you run into issues, double-check:
- Realtime publication includes `public.messages`
- RLS policies exist and you’re authenticated in the app
- Environment variables are correct and the correct Supabase project is used
