'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabase/client';
import { getUser } from '@/actions/auth-actions';

type Blog = {
    id: string;
    title: string;
    url: string;
    feed_url: string;
    last_checked: string | null;
    last_post_date: string | null;
};

export default function BlogList() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch blogs from Supabase
    const fetchBlogs = async () => {
        try {
            // Get the current user
            const { data: userData, error: userError } = await getUser();

            if (userError || !userData.user) {
                setError('You must be logged in to view your blogs.');
                setIsLoading(false);
                return;
            }

            // Fetch blogs for the current user
            const { data, error: blogsError } = await supabaseClient
                .from('blogs')
                .select('*')
                .eq('user_id', userData.user.id)
                .order('title');

            if (blogsError) {
                console.error('Error fetching blogs:', blogsError);
                setError(blogsError.message);
            } else {
                setBlogs(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a blog
    const deleteBlog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog subscription?')) {
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('blogs')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting blog:', error);
                setError(error.message);
            } else {
                // Update the UI by removing the deleted blog
                setBlogs(blogs.filter(blog => blog.id !== id));
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An unexpected error occurred.');
        }
    };

    // Load blogs on component mount
    useEffect(() => {
        fetchBlogs();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
                <div className="p-4 bg-red-100 text-red-700 rounded-md" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-center">
                    You haven&apos;t subscribed to any blogs yet. Add your first blog above!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Subscribed Blogs</h2>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blog</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Post</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {blogs.map((blog) => (
                            <tr key={blog.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                <a href={blog.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                                                    {blog.title}
                                                </a>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {blog.url}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {blog.last_post_date
                                            ? new Date(blog.last_post_date).toLocaleDateString()
                                            : 'Never'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => deleteBlog(blog.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 