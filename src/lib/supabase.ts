import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orpdpcvwwftnncsyzbwq.supabase.co';

// Using the key user confirmed earlier.
// IMPORTANT: In production, use environment variables: import.meta.env.VITE_SUPABASE_KEY
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_kISpxfZJHmxn4uzC1NeELg_thEVRNWA'; // Using the publishable key as identified

// Custom Fetch Wrapper for Diagnostics & Timeout Protection
const customFetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Global Timeout

    // Combine signals if needed (rare for internal calls but good practice)
    const originalSignal = options.signal;
    if (originalSignal) {
        if (originalSignal.aborted) {
            controller.abort();
        } else {
            originalSignal.addEventListener('abort', () => controller.abort());
        }
    }

    try {
        console.log(`[SupabaseClient] Fetching: ${url.toString()}`);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log(`[SupabaseClient] Success: ${url.toString()} [${response.status}]`);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`[SupabaseClient] Error: ${url.toString()}`, error);
        if (error.name === 'AbortError') {
            console.error('[SupabaseClient] Request timed out globally!');
        }
        throw error;
    }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
        fetch: customFetch
    }
});
