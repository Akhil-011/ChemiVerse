import { useEffect, useState } from "react";
import { supabase, getSession, onAuthStateChange } from "@/lib/supabase";

// ─── useAuth Hook ─────────────────────────────────────────────

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const subscription = onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, session, loading };
}

// ─── useSupabaseQuery Hook ────────────────────────────────────

/**
 * Hook to fetch data from Supabase with error and loading states
 */
export function useSupabaseQuery<T = any>(
  table: string,
  filters?: { column: string; value: any; operator?: "eq" | "neq" | "gt" | "lt" }[]
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from(table).select("*");

        if (filters) {
          for (const filter of filters) {
            const operator = filter.operator || "eq";
            query = query[operator](filter.column, filter.value);
          }
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
          setData(null);
        } else {
          setData(data as T[]);
        }
      } catch (err: any) {
        setError(err?.message || "Unknown error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, JSON.stringify(filters)]);

  return { data, loading, error };
}

// ─── useSupabaseMutation Hook ─────────────────────────────────

/**
 * Hook to perform mutations (insert, update, delete) on Supabase
 */
export function useSupabaseMutation<T = any>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async (record: T) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from(table)
        .insert([record])
        .select();
      if (err) {
        setError(err.message);
        return null;
      }
      return data?.[0] as T;
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from(table)
        .update(updates)
        .eq("id", id)
        .select();
      if (err) {
        setError(err.message);
        return null;
      }
      return data?.[0] as T;
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const delete_ = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
      if (err) {
        setError(err.message);
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, delete: delete_, loading, error };
}
