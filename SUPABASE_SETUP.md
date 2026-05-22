# Supabase Setup Guide

This project is configured to use **Supabase** as the backend database and authentication service.

## 📋 Prerequisites

- Supabase account (create one at https://supabase.com)
- Your project created in Supabase

## 🚀 Setup Steps

### 1. **Get Your Supabase Credentials**

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Navigate to **Settings > API** (or **Project Settings > API Keys**)
4. Copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (public, safe to expose in frontend)

### 2. **Configure Environment Variables**

1. Update `.env.local` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **Important**: `.env.local` is in `.gitignore` and won't be committed. Never commit credentials to git!

## 📚 Usage Examples

### **Authentication**

```typescript
import { signUp, signIn, signOut, useAuth } from "@/lib/supabase";

// Sign up
await signUp("user@example.com", "password123");

// Sign in
await signIn("user@example.com", "password123");

// Sign out
await signOut();

// Use in component
function MyComponent() {
  const { user, session, loading } = useAuth();
  
  return (
    <div>
      {loading ? "Loading..." : user ? `Hello ${user.email}` : "Not signed in"}
    </div>
  );
}
```

### **Querying Data**

```typescript
import { useSupabaseQuery } from "@/hooks/use-supabase";

function MyList() {
  const { data, loading, error } = useSupabaseQuery("molecules");
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### **Mutations (Insert, Update, Delete)**

```typescript
import { useSupabaseMutation } from "@/hooks/use-supabase";

function AddMolecule() {
  const { insert, update, delete: remove, loading, error } = useSupabaseMutation("molecules");
  
  const handleAdd = async () => {
    await insert({
      name: "H2O",
      formula: "H₂O",
      description: "Water"
    });
  };
  
  const handleUpdate = async (id: string) => {
    await update(id, { name: "Updated Name" });
  };
  
  const handleDelete = async (id: string) => {
    await remove(id);
  };
  
  return (
    <div>
      <button onClick={handleAdd} disabled={loading}>Add Molecule</button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

### **Direct Database Calls**

```typescript
import {
  fetchTable,
  fetchById,
  insertRecord,
  updateRecord,
  deleteRecord,
  queryTable,
} from "@/lib/supabase";

// Fetch all records
const molecules = await fetchTable("molecules");

// Fetch by ID
const molecule = await fetchById("molecules", "123");

// Query with filters
const filtered = await queryTable("molecules", [
  { column: "atomic_number", value: 8, operator: "gt" }
]);

// Insert
await insertRecord("molecules", { name: "H2O", formula: "H₂O" });

// Update
await updateRecord("molecules", "123", { name: "Updated" });

// Delete
await deleteRecord("molecules", "123");
```

## 🗄️ Database Schema Setup

To create tables in Supabase:

1. Go to **Supabase Dashboard > SQL Editor**
2. Create a new query and run this example:

```sql
-- Create molecules table
CREATE TABLE molecules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  formula TEXT NOT NULL,
  atomic_number INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE molecules ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON molecules
  FOR SELECT USING (true);

-- Allow authenticated users to create, update, delete
CREATE POLICY "Allow authenticated users" ON molecules
  FOR ALL USING (auth.role() = 'authenticated');
```

## 🧪 Quiz Tables

The quiz system writes attempt summaries locally and syncs them to Supabase when the user is signed in. Run this SQL if you want quiz history, attempts, and score tracking persisted in Postgres:

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  question_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  answer JSONB NOT NULL,
  options JSONB,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  module TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  context_label TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  accuracy INT NOT NULL,
  time_spent_seconds INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  module TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  context_label TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  accuracy INT NOT NULL,
  time_spent_seconds INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  topic TEXT NOT NULL,
  best_score INT NOT NULL DEFAULT 0,
  best_accuracy INT NOT NULL DEFAULT 0,
  attempt_count INT NOT NULL DEFAULT 0,
  weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, module, topic)
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public read quiz questions" ON quiz_questions FOR SELECT USING (true);

CREATE POLICY "Users manage own quiz attempts" ON user_quiz_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own quiz history" ON quiz_history
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users manage own scores" ON user_scores
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 🔐 Security Best Practices

1. **Use Row Level Security (RLS)** - Always enable it on your tables
2. **Set Policies** - Control who can read/write data
3. **Never commit `.env.local`** - It's gitignored, keep it safe
4. **Use Service Role Key only on backend** - Never expose in frontend code
5. **Keep Anon Key in environment variables** - It's safe to expose in React

## 🔗 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

## ❓ Troubleshooting

**Error: "Missing Supabase environment variables"**
- Check `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`

**CORS errors?**
- Go to Supabase > Project Settings > API > CORS configuration
- Add your frontend URL (e.g., `http://localhost:8081`)

**RLS Policy blocking queries?**
- Check your policies are set correctly in Supabase dashboard
- Temporarily disable RLS for testing (not production!)

## 📝 Files Created

- `src/lib/supabase.ts` - Supabase client & helper functions
- `src/hooks/use-supabase.ts` - React hooks for queries & mutations
- `.env.local` - Environment configuration (not committed to git)
