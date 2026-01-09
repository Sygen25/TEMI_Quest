import { supabase } from '../lib/supabase';

export interface UserProfile {
    id?: number; // Internal DB ID (Deprecate usage in frontend)
    user_id: string; // UUID from Auth (Primary Identifier)
    client_id?: string; // Legacy
    display_name: string;
    email: string;
    avatar_url: string | null;
}

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1O9wbtqdBrh5xAbgG-NoBUL-m5ewCL0_hOmAX4hUbSmx_uoRnfwgjJO8WfBcOzxb3vM33epDc1aJfgMMrzCOv2yYEcryOkye1Fa7ThGR-d4KZXoSDKCJpK_TyENI_eEMKsbMpXQAMyb1vfYDXQ_WGAmhgiS9RxYwJAYNWhq5KL7Au2Nz61qfhAPECL0S1tO0JkGDLLYi857vZ65T5Si4q_kDW0bXspwks0Qk3cMRIntjK3nage2sbJsW2WdOOUejDB7fhG00h1M';

export const ProfileService = {
    async getProfile(passedSession?: { access_token: string; user: { id: string; email?: string; user_metadata?: any } }): Promise<UserProfile> {
        try {
            let session = passedSession;
            if (!session) {
                const { data } = await supabase.auth.getSession();
                session = data.session as any;
            }
            if (!session) throw new Error('No active session');

            console.log('[ProfileService] Fetching profile for:', session.user.id);

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                // If specifically "PGRST116" (no rows), user doesn't exist yet
                if (error.code === 'PGRST116') {
                    console.warn('[ProfileService] Profile not found, creating new...');
                    return this.createProfile(session.user.id, session.user.email || '', session.user.user_metadata?.display_name);
                }
                throw error;
            }

            return {
                ...data,
                avatar_url: data.avatar_url || DEFAULT_AVATAR
            };

        } catch (error) {
            console.error('[ProfileService] Error fetching profile:', error);
            throw error;
        }
    },

    async createProfile(userId: string, email: string, displayName?: string): Promise<UserProfile> {
        const newProfile = {
            client_id: userId,
            user_id: userId,
            display_name: displayName || 'Colega Médico',
            email: email,
            avatar_url: null
        };

        try {
            console.log('[ProfileService] Creating profile (Standard Upsert)...');
            const { data, error } = await supabase
                .from('user_profiles')
                .upsert(newProfile, { onConflict: 'client_id' })
                .select()
                .single();

            if (error) throw error;

            return {
                ...data,
                avatar_url: data.avatar_url || DEFAULT_AVATAR
            };
        } catch (error) {
            console.error('Error creating profile:', error);
            return {
                client_id: userId,
                user_id: userId,
                display_name: 'Usuário',
                email: email,
                avatar_url: DEFAULT_AVATAR
            };
        }
    },

    async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return false;

            const { error } = await supabase
                .from('user_profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', session.user.id); // ✅ FIX: Update by user_id

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    },

    async uploadAvatar(file: File): Promise<string | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            const userId = session.user.id;
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;

            // Upload image
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile
            await supabase
                .from('user_profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId); // ✅ FIX: Update by user_id

            return publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return null;
        }
    }
};
