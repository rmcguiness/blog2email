import Link from 'next/link';
import NavLinks from './components/nav-links';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/actions/auth-actions';

export default async function Navbar() {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <h1 className="text-(--navy-800) font-bold text-xl">Blog2Email</h1>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <NavLinks label="Home" href="/" />
                            {user && (
                                <NavLinks label="Dashboard" href="/dashboard" />
                            )}
                            <NavLinks label="About" href="/about" />
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">
                                    {user.email}
                                </span>
                                <button
                                    onClick={signOut}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-400 btn-primary"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 btn-secondary"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-(--primary-600) hover:bg-(--primary-700) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 btn-primary"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}