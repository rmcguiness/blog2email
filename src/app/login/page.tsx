'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/actions/auth-actions';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (formData: FormData) => {
        setError(null);
        setLoading(true);
        try {
            const result = await login(formData);
            if (result.error) {
                setLoading(false);
                // Handle specific error messages from Supabase
                switch (result.error) {
                    case 'Invalid login credentials':
                        setError('Invalid email or password');
                        break;
                    case 'User not found':
                        setError('User not found');
                        break;
                    default:
                        setError(result.error || 'Something went wrong during signup. Please try again.');
                }
            }
        } catch (error) {
            setLoading(false);
            if (error instanceof Error) {
                // Filter out the redirect "error" which isn't really an error
                if (!error.toString().includes('NEXT_REDIRECT')) {
                    setError(error.toString());
                }
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-md p-8 space-y-8 card bg-white rounded-lg shadow-md border border-gray-200">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Log In</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your Blog2Email account
                    </p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200 relative" role="alert">
                        <button onClick={() => setError(null)} className="text-red-700 text-sm absolute top-2 right-2 hover:cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" action={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy-400 focus:border-navy-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy-400 focus:border-navy-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-navy-600 border border-transparent rounded-md shadow-sm hover:bg-navy-700 btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <p className="mt-2">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-(--navy-600) hover:text-(--navy-700)">
                            Sign up
                        </Link>
                    </p>
                    <p className="mt-2">
                        <Link href="/forgot-password" className="font-medium text-(--navy-600) hover:text-(--navy-700)">
                            Forgot your password?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}