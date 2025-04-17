'use client';

import { useState } from 'react';
import { fetchFeed } from '@/lib/rss';
import { getUser } from '@/actions/auth-actions';
import { supabaseClient } from '@/utils/supabase/client';

export default function AddBlogForm() {
    const [url, setUrl] = useState('');
    const [feedUrl, setFeedUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Function to automatically detect RSS feed URL from a blog URL
    const detectFeed = async () => {
        console.log('Detecting feed');
        if (!url) {
            setError('Please enter a blog URL');
            return;
        }

        setIsDetecting(true);
        setError(null);

        try {
            // In a real app, you'd want to do this server-side
            // This is a simplified example
            const response = await fetch(`/api/detect-feed?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.feedUrl) {
                setFeedUrl(data.feedUrl);
                setSuccess('Feed URL detected successfully!');
            } else {
                setError('Could not detect feed URL. Please enter it manually.');
            }
        } catch (err) {
            setError('Error detecting feed URL. Please enter it manually.');
            console.error(err);
        } finally {
            setIsDetecting(false);
        }
    };

    // Function to submit the form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form');
        if (!url || !feedUrl) {
            setError('Please provide both blog URL and feed URL');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Test if the feed can be parsed
            const feed = await fetchFeed(feedUrl);

            if (!feed) {
                setError('Unable to parse the feed. Please check the feed URL.');
                setIsLoading(false);
                return;
            }

            // Store in Supabase
            const { data: userData, error: userError } = await getUser();

            if (userError || !userData.user) {
                setError('You must be logged in to add a blog.');
                setIsLoading(false);
                return;
            }

            const { error: insertError } = await supabaseClient
                .from('blogs')
                .insert({
                    title: feed.title || 'Unnamed Blog',
                    url: url,
                    feed_url: feedUrl,
                    user_id: userData.user.id,
                });

            if (insertError) {
                console.error('Error adding blog:', insertError);
                setError(insertError.message);
            } else {
                setSuccess('Blog added successfully!');
                setUrl('');
                setFeedUrl('');
            }
        } catch (err) {
            setError('Error adding blog. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add a Blog</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md" role="alert">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                        Blog URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={detectFeed}
                            disabled={isDetecting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {isDetecting ? 'Detecting...' : 'Detect Feed'}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Feed URL
                    </label>
                    <input
                        type="url"
                        id="feedUrl"
                        value={feedUrl}
                        onChange={(e) => setFeedUrl(e.target.value)}
                        placeholder="https://example.com/feed.xml"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        RSS, Atom, or JSON Feed URL. Click &quot;Detect Feed&quot; to try to find it automatically.
                    </p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Adding...' : 'Add Blog'}
                    </button>
                </div>
            </form>
        </div>
    );
} 