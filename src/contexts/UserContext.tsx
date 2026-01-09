import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileService } from '../services/profile';
import type { UserProfile } from '../services/profile';
import type { Session } from '@supabase/supabase-js';

interface UserContextData {
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Initialize session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (isMounted) {
                console.log('[UserContext] Initial session check:', !!session);
                setSession(session);
                setLoading(false); // Auth is "ready" (either logged in or not)
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log('Auth event:', event);
            if (isMounted) {
                setSession(newSession);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Effect to load profile whenever session changes
    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            if (!session) {
                if (isMounted) setUser(null);
                return;
            }

            console.log('[UserContext] Loading profile for session user:', session.user.id);
            try {
                const profile = await ProfileService.getProfile(session);
                if (isMounted) setUser(profile);
            } catch (error) {
                console.error('[UserContext] Failed to load profile:', error);
                // Don't clear user here necessarily, or maybe handle error state
            }
        }

        loadProfile();

        return () => { isMounted = false; };
    }, [session]);

    async function refreshUser() {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession); // This triggers the useEffect above
    }

    return (
        <UserContext.Provider value={{ user, session, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
