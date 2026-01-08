import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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
        loadUser();
    }, []);

    async function loadUser() {
        try {
            const profile = await ProfileService.getProfile();
            setUser(profile);
        } catch (error) {
            console.error('Failed to load user profile in context', error);
        } finally {
            setLoading(false);
        }
    }

    async function refreshUser() {
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
