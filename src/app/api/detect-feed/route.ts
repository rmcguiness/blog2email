import { NextResponse } from 'next/server';

// Common feed paths to check
const COMMON_FEED_PATHS = [
  '/feed',
  '/rss',
  '/feed.xml',
  '/rss.xml',
  '/atom.xml',
  '/feed/atom',
  '/feed/rss',
  '/rss/atom',
  '/index.xml',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Parse the URL to get the base domain
    let baseUrl: string;
    try {
      const urlObj = new URL(url);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // First, try to fetch the HTML of the page to look for feed links
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Blog2Email Feed Detector/1.0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Look for <link> tags with RSS/Atom feeds
      const feedUrls = [];
      
      // Match link rel="alternate" with type="application/rss+xml" or similar
      const linkRegex = /<link[^>]*rel=["'](?:alternate)[^>]*type=["']application\/(?:rss|atom)\+xml[^>]*href=["']([^"']+)["'][^>]*>/gi;
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        let feedUrl = match[1];
        
        // Handle relative URLs
        if (feedUrl.startsWith('/')) {
          feedUrl = `${baseUrl}${feedUrl}`;
        } else if (!feedUrl.startsWith('http')) {
          feedUrl = `${baseUrl}/${feedUrl}`;
        }
        
        feedUrls.push(feedUrl);
      }
      
      // If we found feed URLs in the HTML, return the first one
      if (feedUrls.length > 0) {
        return NextResponse.json({ feedUrl: feedUrls[0] });
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      // Continue to fallback methods
    }

    // Fallback: Try common feed paths
    for (const path of COMMON_FEED_PATHS) {
      const feedUrl = `${baseUrl}${path}`;
      
      try {
        const response = await fetch(feedUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Blog2Email Feed Detector/1.0',
          },
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType && (
            contentType.includes('xml') || 
            contentType.includes('rss') || 
            contentType.includes('atom') ||
            contentType.includes('json')
          )) {
            return NextResponse.json({ feedUrl });
          }
        }
      } catch (error) {
        // Ignore errors for individual feed path attempts
        console.error(`Error checking ${feedUrl}:`, error);
      }
    }

    // No feed found
    return NextResponse.json(
      { error: 'Could not detect feed URL' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error in detect-feed API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 