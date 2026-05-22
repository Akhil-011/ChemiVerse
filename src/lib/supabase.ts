import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth Helper Functions ────────────────────────────────────

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session
 */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}

// ─── Database Helper Functions ────────────────────────────────

/**
 * Fetch all records from a table
 */
export async function fetchTable<T = any>(table: string) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data as T[];
}

/**
 * Fetch a single record by ID
 */
export async function fetchById<T = any>(table: string, id: string) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as T;
}

/**
 * Insert a new record
 */
export async function insertRecord<T = any>(table: string, record: T) {
  const { data, error } = await supabase
    .from(table)
    .insert([record])
    .select();
  if (error) throw error;
  return data?.[0] as T;
}

/**
 * Update a record by ID
 */
export async function updateRecord<T = any>(
  table: string,
  id: string,
  updates: Partial<T>
) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data?.[0] as T;
}

/**
 * Delete a record by ID
 */
export async function deleteRecord(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

/**
 * Query records with filters
 */
export async function queryTable<T = any>(
  table: string,
  filters?: { column: string; value: any; operator?: "eq" | "neq" | "gt" | "lt" }[]
) {
  let query = supabase.from(table).select("*");

  if (filters) {
    for (const filter of filters) {
      const operator = filter.operator || "eq";
      query = query[operator](filter.column, filter.value);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as T[];
}

export default supabase;
