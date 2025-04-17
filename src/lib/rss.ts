import Parser from 'rss-parser';

type CustomItem = {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
};

type CustomFeed = {
  title: string;
  description: string;
  link: string;
  items: CustomItem[];
};

const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: ['creator', 'content', 'contentSnippet'],
  },
});

/**
 * Fetches and parses an RSS feed from a given URL
 */
export const fetchFeed = async (
  feedUrl: string
): Promise<(CustomFeed & Parser.Output<CustomItem>) | null> => {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed;
  } catch (error) {
    console.error(`Error fetching feed from ${feedUrl}:`, error);
    return null;
  }
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
    const text = item.content.replace(/<[^>]*>?/gm, '');
    return truncateText(text, 200);
  }

  return 'No description available.';
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
  return text.substring(0, maxLength).trim() + '...';
}; 