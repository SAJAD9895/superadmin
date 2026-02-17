
import { createClient } from '@supabase/supabase-js';

// WARNING: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom fetch wrapper to intercept errors globally
const customFetch = async (...args) => {
    try {
        const response = await fetch(...args);

        // Check for specific error status codes
        if (!response.ok) {
            if (response.status === 413) {
                // Payload Too Large
                window.dispatchEvent(new CustomEvent('global-api-error', {
                    detail: {
                        title: 'File Too Large',
                        message: 'The file you are trying to upload is too big. Please upload a smaller file (max 5MB).',
                        originalError: response.statusText
                    }
                }));
            }
            // We can add more specific error handling here
        }

        return response;
    } catch (error) {
        // Network errors, etc.
        console.error('Global Fetch Error:', error);
        throw error;
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: customFetch
    }
});
