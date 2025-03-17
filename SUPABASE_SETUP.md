# Supabase Setup for the API Game

This document provides instructions on how to set up Supabase for email collection in the API Game.

## 1. Create a Supabase Account

If you don't already have one, create a free Supabase account at https://supabase.com

## 2. Create a New Project

1. Log in to your Supabase dashboard
2. Click "New Project"
3. Enter a name for your project (e.g., "API Game")
4. Choose an organization
5. Set a strong database password (you won't need this for the game)
6. Choose a region closest to your users
7. Click "Create New Project" and wait for it to be created

## 3. Create the Email Subscribers Table

### Using the Table Editor (easiest method)

1. Go to the "Table Editor" section in the left sidebar
2. Click "Create a new table"
3. Set the table name to `email_subscribers` (important: use lowercase)
4. Make sure "Enable Row Level Security (RLS)" is checked
5. In the Columns section, keep `id` and `created_at` that are added by default
6. Add the following additional columns:
   - email: text (check "Is Unique")
   - name: text
   - professional_title: text
   - score: integer
   - submitted_at: timestamp with time zone
   - game_outcome: text
7. Click "Save" to create the table

### Using SQL (alternative method)

If you prefer to use SQL, go to the SQL Editor and run this query:

```sql
CREATE TABLE public.email_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    email text UNIQUE NOT NULL,
    name text,
    professional_title text,
    score integer,
    submitted_at timestamp with time zone,
    game_outcome text
);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
```

## 4. Set Up Row Level Security (RLS) Policy - CRITICAL STEP

This is the step that commonly causes permission errors. Follow these instructions carefully:

### Method 1: Using SQL (Most Reliable)

Go to the SQL Editor and run this SQL script to create a proper INSERT policy:

```sql
-- First, make sure RLS is enabled
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies to start fresh
DROP POLICY IF EXISTS email_subscribers_insert_policy ON public.email_subscribers;

-- Create INSERT policy
CREATE POLICY email_subscribers_insert_policy
ON public.email_subscribers
FOR INSERT
TO public
WITH CHECK (true);
```

### Method 2: Using the Policies UI

If you prefer to use the UI:

1. Go to "Authentication" in the left sidebar
2. Click on "Policies"
3. Find and select the `email_subscribers` table in the list
4. Click the "New Policy" button
5. Choose "Create a policy from scratch"
6. For "Policy Type" select "INSERT" (this is critical!)
7. Name it "Allow inserts from anyone"
8. For the policy definition, you should see "WITH CHECK expression" and set it to: `true`
9. Click "Review" then "Save Policy"

### Verifying Your RLS Policy

To verify your policy was created correctly, run this in SQL Editor:

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'email_subscribers';
```

You should see a policy for INSERT with `with_check` set to `true`.

## 5. Get Your Supabase Credentials

1. Go to the "Project Settings" section (gear icon in the left sidebar)
2. Click on "API" in the sidebar
3. Find your "Project URL" in the "Project Configuration" section
4. Find your "anon" public key in the "Project API keys" section
5. Copy these values

## 6. Update the Game Code

1. Open `sketch.js` in your code editor
2. Find the Supabase configuration variables (around line 60)
3. Replace the placeholders with your actual credentials:

```javascript
let SUPABASE_URL = "https://your-project-id.supabase.co";
let SUPABASE_KEY = "your-anon-key";
```

4. Save the file

## 7. Test the Game

1. Open the game in your browser
2. Open your browser's Developer Console (F12 or right-click and select "Inspect" > "Console")
3. Look for messages about the Supabase connection in the console
4. Play the game and win
5. Enter your email in the form that appears
6. Check the console for any error messages
7. Check your Supabase dashboard to confirm the email was saved

## Troubleshooting

If you're getting errors when trying to submit emails, check the browser console (F12) for detailed error messages:

### Common Issues:

1. **Permission denied error**:
   - This is almost always an RLS policy issue
   - Make sure you've created an INSERT policy with WITH CHECK set to `true`
   - Try using the SQL method provided above for reliable results
   - Check if RLS is enabled on the table

2. **Table not found error**:
   - Make sure you created the `email_subscribers` table exactly as specified
   - Check for typos in the table name
   - Make sure to use lowercase for the table name

3. **Library not loaded**:
   - Check that the Supabase script is properly loaded in index.html
   - Check for any network errors in the browser console

4. **Other errors**:
   - The console will display specific error messages that can help identify the issue
   - Double-check your Supabase URL and anon key for typos

5. **Check your dev console network tab**:
   - Look at the actual request going to Supabase
   - The response may contain more detailed error information

For additional help, visit the [Supabase documentation](https://supabase.com/docs). 