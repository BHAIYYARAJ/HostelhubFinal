import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "owner" | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: "student" | "owner"
  ) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
}

async function buildUser(supaUser: SupaUser): Promise<User> {
  // Fetch role and profile in parallel. A missing/failed role lookup must not
  // silently turn an owner into a student.
  const [rolesResult, profileResult] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", supaUser.id)
        .limit(1),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", supaUser.id)
        .single(),
    ]);

  const roleValue = rolesResult.data?.[0]?.role;
  const role = roleValue === "owner" || roleValue === "student" ? roleValue : null;
  const name = profileResult.data?.full_name || supaUser.user_metadata?.full_name || supaUser.email?.split("@")[0] || "";

  return {
    id: supaUser.id,
    name,
    email: supaUser.email || "",
    role,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initialize: () => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer async work to avoid blocking the auth state change resolution
      setTimeout(async () => {
        try {
          if (session?.user) {
            const user = await buildUser(session.user);
            set({ user, loading: false, initialized: true });
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        } catch {
          set({ user: null, loading: false, initialized: true });
        }
      }, 0);
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = await buildUser(session.user);
        set({ user, loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });

    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      return { error: error.message };
    }
    return { error: null };
  },

  signup: async (name, email, password, role) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role },
        },
      });
      if (error) {
        set({ loading: false });
        return { error: error.message };
      }
      // If no session returned (email confirmation required), handle gracefully
      if (!data.session) {
        set({ loading: false });
        return { error: null, needsConfirmation: true };
      }
      return { error: null };
    } catch (err: any) {
      set({ loading: false });
      return { error: err?.message || "Signup failed" };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
