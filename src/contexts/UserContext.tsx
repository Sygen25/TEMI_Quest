import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileService } from '../services/profile';
import type { UserProfile } from '../services/profile';

interface UserContextData {
    user: UserProfile | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                await loadUser();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                loadUser();
            } else {
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function loadUser() {
        try {
            const profile = await ProfileService.getProfile();
            setUser(profile);
        } catch (error) {
            console.error('Failed to load user profile in context', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function refreshUser() {
        setLoading(true);
        await loadUser();
    }

    return (
        <UserContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
