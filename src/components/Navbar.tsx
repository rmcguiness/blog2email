'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';

export default function Navbar() {
    const { user, signOut } = useAuth();
    console.log(user);
    const pathname = usePathname();
    const handleSignOut = () => {
        signOut();
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <h1 className="text-navy-700 font-bold text-xl">Blog2Email</h1>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/'
                                    ? 'border-navy-500 text-gray-900'
                                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Home
                            </Link>
                            {user && (
                                <Link
                                    href="/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/dashboard'
                                        ? 'border-navy-500 text-gray-900'
                                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                            )}
                            <Link
                                href="/about"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/about'
                                    ? 'border-navy-500 text-gray-900'
                                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                About
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-400 btn-primary"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-400 btn-secondary"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-400 btn-primary"
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