import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'technician'
  ) => Promise<{ error: any; emailConfirmationSent?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfileForUser(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfileForUser(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureProfileForUser = async (u: User) => {
    try {
      // Intentar cargar perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        setLoading(false);
        return;
      }

      // Si no existe, crearlo usando user_metadata
      const full_name = (u.user_metadata?.full_name as string) || '';
      const role = (u.user_metadata?.role as 'client' | 'technician') || 'client';
      const email = u.email || '';

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: u.id,
          email,
          full_name,
          role,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        setProfile(inserted as Profile);
      }
    } catch (e) {
      console.error('ensureProfileForUser error:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'technician'
  ) => {
    try {
      const isWeb = typeof window !== 'undefined';
      // Redirigir a pantalla de confirmación exitosa tras confirmar email
      const redirectTo = isWeb
        ? `${window.location.origin}/(auth)/email-confirmed`
        : 'oficiosya:///(auth)/email-confirmed';
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo, data: { full_name: fullName, role } },
      });

      if (authError) return { error: authError };
      if (!authData.user) return { error: new Error('No user returned') };

      const emailConfirmationSent = !authData.session; // Si no hay sesión inmediata, requiere confirmación
      return { error: null, emailConfirmationSent };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
