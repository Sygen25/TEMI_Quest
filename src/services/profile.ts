import { supabase } from '../lib/supabase';
import { getClientId } from './progress';

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
        const clientId = getClientId();

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('client_id', clientId)
                .single();

            if (error && error.code === 'PGRST116') {
                // No profile exists, create one
                return this.createProfile();
            }

            if (error) throw error;

            return {
                ...data,
                avatar_url: data.avatar_url || DEFAULT_AVATAR
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            return {
                client_id: clientId,
                display_name: 'Usuário',
                email: '',
                avatar_url: DEFAULT_AVATAR
            };
        }
    },

    async createProfile(): Promise<UserProfile> {
        const clientId = getClientId();

        const newProfile: Partial<UserProfile> = {
            client_id: clientId,
            display_name: 'Usuário',
            email: '',
            avatar_url: null
        };

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .insert(newProfile)
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
                client_id: clientId,
                display_name: 'Usuário',
                email: '',
                avatar_url: DEFAULT_AVATAR
            };
        }
    },

    async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
        const clientId = getClientId();

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('client_id', clientId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    },

    async uploadAvatar(file: File): Promise<string | null> {
        const clientId = getClientId();
        const fileExt = file.name.split('.').pop();
        const fileName = `${clientId}-${Date.now()}.${fileExt}`;

        try {
            // Upload image
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with new avatar URL directly
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('client_id', clientId);

            if (updateError) {
                console.error('Update error:', updateError);
                throw updateError;
            }

            return publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return null;
        }
    }
};
