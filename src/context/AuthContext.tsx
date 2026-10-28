import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>;
  continueAsGuest: (email?: string) => void;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'octopus_guest_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for stored guest session
    const storedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
    if (storedGuest) {
      try {
        const parsedUser = JSON.parse(storedGuest);
        setUser(parsedUser);
        setIsGuest(true);
      } catch {
        // Ignore
      }
    }

    // 2. Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
      setLoading(false);
    });

    // 3. Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } else if (!localStorage.getItem(GUEST_STORAGE_KEY)) {
        setSession(null);
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/studio`,
      },
    });
    return { error };
  };

  const continueAsGuest = (email: string = 'demo-supplier@b2b-image.studio') => {
    const mockUser: any = {
      id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
      email,
      user_metadata: { name: 'Demo Supplier' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsGuest(true);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setUser(null);
    setSession(null);
    setIsGuest(false);
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isGuest,
        loading,
        signInWithOtp,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
