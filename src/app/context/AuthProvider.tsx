'use client'
import { Session, User } from '@supabase/supabase-js';
import { useContext, useState, useEffect, createContext } from 'react';
import { supabaseClient } from '@/utils/supabase/client';
import { signOut } from '@/actions/auth-actions';

// create a context for authentication
const AuthContext = createContext<{ session: Session | null | undefined, user: User | null | undefined, signOut: () => void }>({ session: null, user: null, signOut: () => { } });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const refreshSession = async () => {
            const { error } = await supabaseClient.auth.refreshSession()
            if (error) console.error('Error refreshing session:', error)
        }
        const setData = async () => {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            if (error) throw error;
            setUser(user)
            setSession(user?.user_metadata.session)
            setLoading(false);
        };

        // const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        //     setSession(session);
        //     setUser(session?.user)
        //     setLoading(false)
        // });

        setData();
        if (session) {
            const expiresAt = session.expires_at ? session.expires_at * 1000 : 0; // Convert to milliseconds
            const timeToRefresh = expiresAt - Date.now() - (5 * 60 * 1000) // 5 minutes before expiry

            if (timeToRefresh > 0) {
                const refreshTimer = setTimeout(refreshSession, timeToRefresh)
                return () => clearTimeout(refreshTimer)
            } else {
                refreshSession()
            }
        }

        return () => {
            // listener?.subscription.unsubscribe();
        };
    }, [session]);

    const value = {
        session,
        user,
        signOut: signOut,
    };

    // use a provider to pass down the value
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// export the useAuth hook
export const useAuth = () => {
    return useContext(AuthContext);
};