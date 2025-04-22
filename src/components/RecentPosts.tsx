'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/actions/auth-actions';
import { supabaseClient } from '@/utils/supabase/client';

type BlogPost = {
    id: string;
    title: string;
    description: string | null;
    url: string;
    published_at: string;
    blog: {
        title: string;
    };
};

export default function RecentPosts() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch recent posts from Supabase
    const fetchRecentPosts = async () => {
        try {
            // Get the current user
            const { data: userData, error: userError } = await getUser();

            if (userError || !userData.user) {
                setError('You must be logged in to view recent posts.');
                setIsLoading(false);
                return;
            }

            // First get the blog IDs the user is subscribed to
            const { data: blogIds, error: blogIdsError } = await supabaseClient
                .from('blogs')
                .select('id')
                .contains('user_id', [userData.user.id]);

            if (blogIdsError) {
                console.error('Error fetching blog IDs:', blogIdsError);
                setError(blogIdsError.message);
                setIsLoading(false);
                return;
            }

            // If no blogs, return empty list
            if (!blogIds || blogIds.length === 0) {
                setPosts([]);
                setIsLoading(false);
                return;
            }

            // Extract just the IDs into an array
            const ids = blogIds.map(blog => blog.id);

            // Fetch recent posts for the user's subscribed blogs
            const { data, error: postsError } = await supabaseClient
                .from('blog_posts')
                .select(`
          id, 
          title, 
          description, 
          url, 
          published_at,
          blog:blog_id (
            title
          )
        `)
                .in('blog_id', ids)
                .order('published_at', { ascending: false })
                .limit(10);

            if (postsError) {
                console.error('Error fetching posts:', postsError);
                setError(postsError.message);
            } else {
                // Transform the data to match our expected type
                const formattedPosts: BlogPost[] = data?.map(post => {
                    // Ensure we have a blog object with a title
                    let blogTitle = 'Unknown Blog';
                    if (post.blog && typeof post.blog === 'object') {
                        // If blog is an array, take the first item, otherwise use it directly
                        const blogObj = Array.isArray(post.blog) ? post.blog[0] : post.blog;
                        blogTitle = blogObj?.title || 'Unknown Blog';
                    }

                    return {
                        id: post.id,
                        title: post.title,
                        description: post.description,
                        url: post.url,
                        published_at: post.published_at,
                        blog: {
                            title: blogTitle
                        }
                    };
                }) || [];

                setPosts(formattedPosts);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // Load posts on component mount
    useEffect(() => {
        fetchRecentPosts();
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

    if (posts.length === 0) {
        return (
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-center">
                    No recent posts from your subscribed blogs.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Posts</h2>

            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="text-sm text-gray-500 mb-1">
                            {new Date(post.published_at).toLocaleDateString()} • {post.blog.title}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                                {post.title}
                            </a>
                        </h3>
                        {post.description && (
                            <p className="text-gray-600 mb-3">{post.description}</p>
                        )}
                        <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                            Read full post
                            <svg
                                className="ml-1 w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
} 