import { createClient } from "@supabase/supabase-js";

type SupabaseError = Error & { status?: number };

type QueryResult<T = unknown> = {
  data: T | null;
  error: SupabaseError | null;
};

type QueryBuilder<T = unknown> = PromiseLike<QueryResult<T>> & {
  select: () => Promise<QueryResult<T>> | QueryBuilder<T>;
  insert: () => Promise<QueryResult<T>> | QueryBuilder<T>;
  update: () => QueryBuilder<T>;
  delete: () => QueryBuilder<T>;
  eq: () => QueryBuilder<T>;
  order: () => QueryBuilder<T>;
  limit: () => QueryBuilder<T>;
  single: () => Promise<QueryResult<T>>;
};

type SupabaseAuthResponse<T = unknown> = {
  data: T;
  error: SupabaseError | null;
};

const createSupabaseError = (): SupabaseError => {
  const error = new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the deployment environment."
  ) as SupabaseError;
  error.status = 503;
  return error;
};

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabaseConfigError = createSupabaseError();
let missingConfigLogged = false;

function logMissingConfigOnce() {
  if (missingConfigLogged) return;
  missingConfigLogged = true;
  console.warn("[supabase] Missing Supabase env vars; auth and synced features will be disabled until configured.");
}

function createUnavailableQuery<T = unknown>(): QueryBuilder<T> {
  const result = Promise.resolve<QueryResult<T>>({
    data: null,
    error: supabaseConfigError,
  });

  const builder: QueryBuilder<T> = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => result,
    then: result.then.bind(result),
  };

  return builder;
}

function createUnavailableAuth() {
  const sessionResponse: SupabaseAuthResponse<{ session: null }> = {
    data: { session: null },
    error: null,
  };

  const userResponse: SupabaseAuthResponse<{ user: null }> = {
    data: { user: null },
    error: null,
  };

  return {
    signUp: async (): Promise<SupabaseAuthResponse> => ({ data: null, error: supabaseConfigError }),
    signInWithPassword: async (): Promise<SupabaseAuthResponse> => ({ data: null, error: supabaseConfigError }),
    signOut: async (): Promise<SupabaseAuthResponse> => ({ data: null, error: supabaseConfigError }),
    getUser: async () => userResponse,
    getSession: async () => sessionResponse,
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe() {
            return undefined;
          },
        },
      },
    }),
  };
}

function createUnavailableSupabaseClient() {
  logMissingConfigOnce();

  return {
    auth: createUnavailableAuth(),
    from: <T = unknown>() => createUnavailableQuery<T>(),
  } as const;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : createUnavailableSupabaseClient();

// ─── Auth Helper Functions ────────────────────────────────────

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, displayName?: string) {
  if (!isSupabaseConfigured) {
    throw supabaseConfigError;
  }

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
  if (!isSupabaseConfigured) {
    throw supabaseConfigError;
  }

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
  if (!isSupabaseConfigured) {
    throw supabaseConfigError;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session
 */
export async function getSession() {
  if (!isSupabaseConfigured) {
    return null;
  }

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
  if (!isSupabaseConfigured) {
    return {
      unsubscribe() {
        return undefined;
      },
    };
  }

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
