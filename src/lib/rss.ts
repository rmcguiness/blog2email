import Parser from "rss-parser";

export type CustomItem = {
  title: string;
  link?: string;
  content?: string;
  category?: string;
  contentSnippet?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  categories?: string[];
  guid?: string;
  "content:encoded"?: string;
  "dc:creator"?: string;
};

export type CustomFeed = {
  title: string;
  description: string;
  link: string;
  items: CustomItem[];
};

const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    feed: ["title", "description", "link"],
    item: [
      "title",
      "link",
      "content",
      "contentSnippet",
      "isoDate",
      "pubDate",
      "creator",
      "author",
      "categories",
      "guid",
      "content:encoded",
      "dc:creator",
    ],
  },
});

/**
 * Uses Puppeteer to discover feed URLs for a website
 */
export const discoverFeedWithPlaywright = async (
  url: string
): Promise<string | null> => {
  try {
    console.log(`Using Playwright to discover feed for: ${url}`);

    const response = await fetch(
      `/api/detect-feed-playwright?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      console.error(
        `Playwright feed detection failed with status: ${response.status}`
      );
      return null;
    }

    const data = await response.json();

    if (data.feedUrls && data.feedUrls.length > 0) {
      console.log(`Playwright found ${data.count} feed URLs:`, data.feedUrls);
      return data.feedUrls[0]; // Return the first feed URL
    }

    console.log("Playwright couldn't find any feed URLs");
    return null;
  } catch (error) {
    console.error("Error discovering feed with Playwright:", error);
    return null;
  }
};
/**
 * Fetches an RSS feed using Playwright to bypass protections
 */
export async function fetchFeedWithPlaywright(feedUrl: string) {
  try {
    console.log(`Fetching feed with Playwright: ${feedUrl}`);

    // Get the base URL from environment variables
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Construct the full URL
    const fullUrl = `${baseUrl}/api/fetch-feed-playwright?url=${encodeURIComponent(
      feedUrl
    )}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check the content type of the response
    const contentType = response.headers.get("content-type") || "";

    if (
      contentType.includes("application/xml") ||
      contentType.includes("text/xml")
    ) {
      // It's XML data - parse it with your RSS parser
      const text = await response.text();

      // Parse the XML into feed data
      return await parser.parseString(text);
    } else {
      // Assume JSON for other content types
      return await response.json();
    }
  } catch (error) {
    console.error(
      `Error fetching feed with Playwright from ${feedUrl}:`,
      error
    );
    return null;
  }
}

/**
 * Fetches an RSS feed with proper headers to encourage XML response
 */
export const fetchFeedWithHeaders = async (feedUrl: string) => {
  try {
    // Use your proxy with these headers
    const proxyUrl = `/api/proxy-rss?url=${encodeURIComponent(
      feedUrl
    )}&withHeaders=true`;

    const response = await fetch(proxyUrl);
    const text = await response.text();

    // Check if we got HTML instead of RSS
    if (text.trim().startsWith("<html") || text.includes("<!DOCTYPE html>")) {
      console.error("Received HTML instead of an RSS feed from:", feedUrl);
      return null;
    }

    // Parse the feed
    const feed = await parser.parseString(text);
    console.log("Successfully parsed feed:", feed.title);
    return feed;
  } catch (error) {
    console.error(`Error fetching feed from ${feedUrl}:`, error);
    if (error instanceof Error) {
      console.error(`Error type: ${error.name}, Message: ${error.message}`);
    }
    return null;
  }
};

/**
 * Main function to get feed data - tries multiple approaches
 */
export const getFeedData = async (url: string) => {
  console.log(`Attempting to get feed data for: ${url}`);

  // First try direct fetching
  try {
    // Try Playwright first since it's more reliable with protected sites
    const playwrightFeed = await fetchFeedWithPlaywright(url);
    if (playwrightFeed) {
      console.log("Successfully fetched feed with Playwright:", playwrightFeed);
      return playwrightFeed;
    }

    // Fallback to regular headers approach
    const directFeed = await fetchFeedWithHeaders(url);
    if (directFeed) {
      return directFeed;
    }
  } catch (error) {
    console.error("Error fetching feed:", error);
    console.log("Direct fetching failed, will try discovery...");
  }

  // If direct fetching fails, try to discover the feed
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

  const discoveredFeedUrl = await discoverFeedWithPlaywright(baseUrl);

  if (discoveredFeedUrl) {
    console.log(`Using discovered feed URL: ${discoveredFeedUrl}`);
    // Use Playwright for the discovered URL too since it's likely protected
    return fetchFeedWithPlaywright(discoveredFeedUrl);
  }

  console.error("Could not find a valid RSS feed for:", url);
  return null;
};

/**
 * Extracts a description/summary from a post
 */
export const extractDescription = (item: CustomItem): string => {
  // Try to get a clean description from various possible fields
  if (item.contentSnippet) {
    return truncateText(item.contentSnippet, 200);
  }

  if (item.content) {
    // Strip HTML tags and truncate
    const text = item.content.replace(/<[^>]*>?/gm, "");
    return truncateText(text, 200);
  }

  return "No description available.";
};

/**
 * Gets the publication date from an item
 */
export const getPublicationDate = (item: CustomItem): Date => {
  if (item.isoDate) {
    return new Date(item.isoDate);
  }
  if (item.pubDate) {
    return new Date(item.pubDate);
  }

  return new Date();
};

/**
 * Helper function to truncate text with ellipsis
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};
