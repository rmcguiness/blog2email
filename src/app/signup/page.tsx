'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthError } from '@supabase/supabase-js';
import { signup } from '@/actions/auth-actions';
import { supabaseClient } from '@/utils/supabase/client';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSignup(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await signup(formData);

            if (result?.error) {
                switch (result.error) {
                    case 'User already registered':
                        setError('This email is already registered. Please try signing in instead.');
                        break;
                    case 'Password should be at least 6 characters':
                        setError('Please use a stronger password (at least 6 characters).');
                        break;
                    default:
                        setError(result.error || 'Something went wrong during signup. Please try again.');
                }
            }

            if (result?.user) {
                setSuccess('Account created successfully! Please check your email for the confirmation link.');
                // Create user profile
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .insert([
                        {
                            id: result.user.id,
                            email: result.user.email,
                        }
                    ]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                }
            }
        } catch (error) {
            if (error instanceof AuthError) {
                // This is a Supabase auth error
                setError(error.message);
            } else if (error instanceof Error) {
                // This is a regular Error
                setError(error.message);
            } else {
                // Unknown error type
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-md p-8 space-y-8 card bg-white rounded-lg shadow-md border border-gray-200">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Create an Account</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Join Blog2Email and never miss a blog update
                    </p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md border border-green-200" role="alert">
                        {success}
                    </div>
                )}

                <form className="mt-8 space-y-6" action={handleSignup}>
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
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy-400 focus:border-navy-500"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                        </div>

                        <div>
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-navy-400 focus:border-navy-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-navy-600 border border-transparent rounded-md shadow-sm hover:bg-navy-700 btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <p className="mt-2">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-navy-600 hover:text-navy-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}