/**
 * AuthContext — React context + provider for Supabase authentication.
 *
 * Provides:
 *   user      – the current Supabase user object (or null)
 *   session   – the current Supabase session (or null)
 *   loading   – true while the initial session check is in progress
 *   signUp    – (email, password) → { data, error }
 *   signIn    – (email, password) → { data, error }
 *   signOut   – () → { error }
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial session check completes

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    // 1. Restore existing session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      })
      .catch(() => {
        setSession(null);
        setUser(null);
      })
      .finally(() => setLoading(false));

    // 2. Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user with email + password.
   * Returns { data, error } from Supabase.
   */
  const signUp = async (email, password) => {
    if (!supabase) {
      return { data: null, error: { message: "Supabase authentication is not configured. Continue as Guest or configure Supabase credentials." } };
    }
    const result = await supabase.auth.signUp({ email, password });
    return result;
  };

  /**
   * Sign in an existing user with email + password.
   * Returns { data, error } from Supabase.
   */
  const signIn = async (email, password) => {
    if (!supabase) {
      return { data: null, error: { message: "Supabase authentication is not configured. Continue as Guest or configure Supabase credentials." } };
    }
    const result = await supabase.auth.signInWithPassword({ email, password });
    return result;
  };

  /**
   * Sign out the current user.
   * Returns { error } from Supabase.
   */
  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    const result = await supabase.auth.signOut();
    return result;
  };

  /**
   * Update password for current authenticated user.
   * Returns { data, error } from Supabase.
   */
  const updatePassword = async (newPassword) => {
    if (!supabase) {
      return { data: null, error: { message: "Supabase authentication is not configured." } };
    }
    const result = await supabase.auth.updateUser({ password: newPassword });
    return result;
  };

  const value = {
    user,
    session,
    loading,
    supabaseConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and methods from any component.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
