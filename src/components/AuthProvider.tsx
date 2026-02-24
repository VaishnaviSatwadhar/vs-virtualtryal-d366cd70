import { useState, useEffect, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Sync Google profile data to profiles table
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            syncUserProfile(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Clear stale session data
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserProfile = async (user: User) => {
    try {
      // Extract Google profile data from user metadata
      const googleData = user.user_metadata;
      const avatarUrl = googleData?.avatar_url || googleData?.picture;
      const fullName = googleData?.full_name || googleData?.name;
      const username = googleData?.username || fullName || user.email?.split('@')[0];

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        await supabase.from('profiles').insert({
          id: user.id,
          username,
          avatar_url: avatarUrl,
        });
      } else if (avatarUrl) {
        // Update avatar if Google login provides one
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
