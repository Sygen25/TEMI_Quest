import { supabase } from '../lib/supabase';

export interface UserProfile {
    id?: number;
    client_id: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
}

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1O9wbtqdBrh5xAbgG-NoBUL-m5ewCL0_hOmAX4hUbSmx_uoRnfwgjJO8WfBcOzxb3vM33epDc1aJfgMMrzCOv2yYEcryOkye1Fa7ThGR-d4KZXoSDKCJpK_TyENI_eEMKsbMpXQAMyb1vfYDXQ_WGAmhgiS9RxYwJAYNWhq5KL7Au2Nz61qfhAPECL0S1tO0JkGDLLYi857vZ65T5Si4q_kDW0bXspwks0Qk3cMRIntjK3nage2sbJsW2WdOOUejDB7fhG00h1M';

export const ProfileService = {
    async getProfile(): Promise<UserProfile> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session');

            const userId = session.user.id;
            const email = session.user.email || '';

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('client_id', userId) // Using auth ID as client_id for backward compatibility in schema
                .single();

            if (error && error.code === 'PGRST116') {
                // No profile exists, create one with auth data
                return this.createProfile(userId, email, session.user.user_metadata?.display_name);
            }

            if (error) throw error;

            return {
                ...data,
                avatar_url: data.avatar_url || DEFAULT_AVATAR
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Return a safe placeholder
            return {
                client_id: 'guest',
                display_name: 'Usuário',
                email: '',
                avatar_url: DEFAULT_AVATAR
            };
        }
    },

    async createProfile(userId: string, email: string, displayName?: string): Promise<UserProfile> {
        const newProfile: Partial<UserProfile> = {
            client_id: userId,
            display_name: displayName || 'Colega Médico',
            email: email,
            avatar_url: null
        };

        try {
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
                .eq('client_id', session.user.id);

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
                .eq('client_id', userId);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return null;
        }
    }
};
