# Orbital HR — MVP Deployment Guide (Zero Coding Required)

This ZIP contains your complete, production-ready **Orbital HR** web application (`React + Vite + Tailwind CSS + Supabase`).

## Step 1: Set Up Your Database & Login on Supabase (Free)
1. Go to **https://supabase.com**, sign up, and click **New Project** (name it `orbital-hr`).
2. Once the project is ready, click **SQL Editor** in the left sidebar → **New Query**.
3. Open the file `supabase/schema.sql` from this folder, copy everything inside, paste it into the SQL Editor, and click **Run**.
   - This creates `early_access_leads` (for public prospects) and `employee_rosters` (private per signed-in company via Row Level Security).
4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public key**

## Step 2: Upload This Folder to GitHub (Free)
1. Go to **https://github.com**, create a free account, and click **New Repository** (`orbital-hr-mvp`).
2. Click **uploading an existing file**, drag all files and folders from this ZIP into the browser window, and click **Commit changes**.

## Step 3: Deploy Live on Vercel or Netlify (Free)
1. Go to **https://vercel.com** (or **https://netlify.com**) and sign in with your GitHub account.
2. Click **Add New Project** → select `orbital-hr-mvp`.
3. Open **Environment Variables** and add two variables:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
4. Click **Deploy**. Within ~60 seconds, your live `https://` URL is ready to share with US and Canadian CFOs and Heads of HR!
