'use client'
import { User } from '@supabase/supabase-js';
import { useContext, useState, useEffect, createContext } from 'react';
import { supabaseClient } from '@/utils/supabase/client';
import { signOut } from '@/actions/auth-actions';

// create a context for authentication
const AuthContext = createContext<{ user: User | null | undefined, signOut: () => void }>({ user: null, signOut: () => { } });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setData = async () => {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            if (error && !user) setUser(null);
            setUser(user)
            setLoading(false);
        };

        setData();
    }, [user]);

    const value = {
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