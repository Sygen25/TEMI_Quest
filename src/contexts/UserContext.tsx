import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileService } from '../services/profile';
import type { UserProfile } from '../services/profile';
import type { Session } from '@supabase/supabase-js';

interface UserContextData {
    user: UserProfile | null;
    session: Session | null;
    userId: string | null; // Dedicated UUID field for easy access
    authReady: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [authReady, setAuthReady] = useState(false);

    // Derived ID for convenience
    const userId = session?.user?.id ?? user?.user_id ?? null;

    useEffect(() => {
        let isMounted = true;

        // 1. Initial Synchronous(ish) Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (isMounted) {
                setSession(session);
                setAuthReady(true);
            }
        });

        // 2. Synchronous Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (isMounted) {
                setSession(newSession);
                setAuthReady(true);
                // If logged out, clear profile immediately
                if (!newSession) {
                    setUser(null);
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // 3. Profile Loading Effect (Decoupled)
    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            if (!session) return;

            // Only fetch if we don't have it (or force refresh logic elsewhere)
            console.log('[UserContext] Loading profile for:', session.user.id);
            try {
                const profile = await ProfileService.getProfile(session);
                if (isMounted) {
                    setUser({
                        ...profile,
                        user_id: session.user.id // Ensure sync with session
                    });
                }
            } catch (error) {
                console.error('[UserContext] Failed to load profile:', error);
                // Fallback: create a minimal profile from session if DB fails
                if (isMounted && !user) {
                    setUser({
                        user_id: session.user.id,
                        email: session.user.email || '',
                        display_name: session.user.user_metadata?.display_name || 'Usuário',
                        avatar_url: null,
                        client_id: session.user.id
                    } as UserProfile);
                }
            }
        }

        loadProfile();

        return () => { isMounted = false; };
    }, [session?.access_token]); // Dependency on token ensures refresh on re-login

    async function refreshUser() {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession) {
            console.log('[UserContext] Refreshing user profile...');
            try {
                const profile = await ProfileService.getProfile(currentSession);
                setUser({
                    ...profile,
                    user_id: currentSession.user.id
                });
            } catch (err) {
                console.error('[UserContext] Failed to refresh profile:', err);
            }
        }
    }

    return (
        <UserContext.Provider value={{ user, session, userId, authReady, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
