import { supabase } from '../lib/supabase';


export interface Notification {
    id: number;
    created_at: string;
    title: string;
    content: string;
    icon: string;
    icon_bg_color: string;
    is_read?: boolean;
}

async function getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
}

export const NotificationService = {
    async getAll(): Promise<Notification[]> {
        const clientId = await getUserId();
        if (!clientId) return [];

        try {
            // Get all notifications
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get read status for this user
            const { data: reads } = await supabase
                .from('notification_reads')
                .select('notification_id')
                .eq('client_id', clientId);

            const readIds = new Set(reads?.map(r => r.notification_id) || []);

            return notifications.map(n => ({
                ...n,
                is_read: readIds.has(n.id)
            }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(notificationId: number): Promise<void> {
        const clientId = await getUserId();
        if (!clientId) return;

        try {
            await supabase
                .from('notification_reads')
                .upsert({
                    notification_id: notificationId,
                    client_id: clientId
                }, { onConflict: 'notification_id,client_id' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    async markAllAsRead(): Promise<void> {
        const clientId = await getUserId();
        if (!clientId) return;

        try {
            const { data: notifications } = await supabase
                .from('notifications')
                .select('id');

            if (notifications) {
                for (const n of notifications) {
                    await supabase
                        .from('notification_reads')
                        .upsert({
                            notification_id: n.id,
                            client_id: clientId
                        }, { onConflict: 'notification_id,client_id' });
                }
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    },

    async getUnreadCount(): Promise<number> {
        const clientId = await getUserId();
        if (!clientId) return 0;

        try {
            const { data: notifications } = await supabase
                .from('notifications')
                .select('id');

            const { data: reads } = await supabase
                .from('notification_reads')
                .select('notification_id')
                .eq('client_id', clientId);

            const readIds = new Set(reads?.map(r => r.notification_id) || []);
            return notifications?.filter(n => !readIds.has(n.id)).length || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    },

    // Admin functions
    async isAdmin(): Promise<boolean> {
        const clientId = await getUserId();
        if (!clientId) return false;

        try {
            const { data } = await supabase
                .from('admin_users')
                .select('id')
                .eq('client_id', clientId)
                .single();

            return !!data;
        } catch {
            return false;
        }
    },

    async createNotification(title: string, content: string, icon: string = 'notifications', iconBgColor: string = 'teal'): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    title,
                    content,
                    icon,
                    icon_bg_color: iconBgColor
                });

            return !error;
        } catch {
            return false;
        }
    },

    async deleteNotification(id: number): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            return !error;
        } catch {
            return false;
        }
    }
};
