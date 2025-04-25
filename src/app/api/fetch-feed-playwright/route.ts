import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

interface WordPressPost {
  title?: {
    rendered: string;
  };
  link?: string;
  date?: string | Date;
  author_name?: string;
  excerpt?: {
    rendered: string;
  };
  content?: {
    rendered: string;
  };
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let browser = null;

  try {
    // Launch browser with more timeout and better waitUntil condition
    browser = await chromium.launch({
      timeout: 60000, // 60 seconds total timeout
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Use a more reliable navigation strategy
    console.log(`Navigating to: ${url}`);

    // First try with load instead of networkidle
    await page.goto(url, {
      waitUntil: "load",
      timeout: 45000,
    });

    // Wait a bit more to make sure any scripts have executed
    await page.waitForTimeout(3000);

    // Get the page content
    const content = await page.content();

    console.log(`Got content from ${url}, length: ${content.length}`);
    console.log(`First 100 chars: ${content.substring(0, 100)}`);

    // Handle Cloudflare protection
    if (
      content.includes("cf-browser-verification") ||
      content.includes("cf_captcha_entry")
    ) {
      console.log("Detected Cloudflare challenge, trying to solve it");

      // Try waiting a bit more for Cloudflare to resolve
      await page.waitForTimeout(5000);

      // Check if there's a title indicating a Cloudflare challenge
      const title = await page.title();
      console.log(`Page title: ${title}`);

      if (
        title.includes("Attention Required") ||
        title.includes("Security Check")
      ) {
        console.log("Still on Cloudflare challenge page after waiting");
      }

      // Get updated content
      const updatedContent = await page.content();

      // If we still have a challenge and not RSS/XML content, we need a different approach
      if (
        updatedContent.includes("cf-browser-verification") &&
        !(updatedContent.includes("<rss") || updatedContent.includes("<feed"))
      ) {
        // Try WordPress JSON API as a fallback
        const wpApiUrl = new URL(url);
        wpApiUrl.pathname = "/wp-json/wp/v2/posts";
        wpApiUrl.search = "?per_page=10";

        console.log(`Trying WordPress API: ${wpApiUrl.toString()}`);

        await page.goto(wpApiUrl.toString(), {
          waitUntil: "load",
          timeout: 30000,
        });
        const wpApiContent = await page.content();

        if (
          wpApiContent.includes('"id":') &&
          wpApiContent.includes('"title":')
        ) {
          console.log("Successfully got WordPress API response");

          // Convert WordPress API JSON to XML format
          const wpJson = await page.evaluate(() => {
            try {
              return JSON.parse(document.body.innerText);
            } catch (e) {
              console.error("Error parsing WordPress API JSON:", e);
              return null;
            }
          });

          if (wpJson && Array.isArray(wpJson)) {
            const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>DoorDash Blog</title>
    <link>${wpApiUrl.origin}</link>
    <description>DoorDash Blog Feed</description>
    ${wpJson
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title?.rendered || "")}</title>
      <link>${post.link || ""}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt?.rendered || "")}</description>
      <content:encoded>${escapeXml(
        post.content?.rendered || ""
      )}</content:encoded>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

            return new Response(xmlContent, {
              headers: {
                "Content-Type": "application/xml",
              },
            });
          }
        }

        return NextResponse.json(
          { error: "Unable to bypass Cloudflare protection" },
          { status: 503 }
        );
      }
    }

    // If it's an RSS feed, it should have XML structure
    if (
      content.includes("<rss") ||
      content.includes("<feed") ||
      content.includes("<channel>")
    ) {
      return new Response(content, {
        headers: {
          "Content-Type": "application/xml",
        },
      });
    } else {
      // Try another approach - check for WordPress REST API
      const wpApiUrl = new URL(url);
      const baseUrl = `${wpApiUrl.protocol}//${wpApiUrl.hostname}`;

      // Navigate to WordPress API
      await page.goto(`${baseUrl}/wp-json/wp/v2/posts?per_page=10`, {
        waitUntil: "load",
        timeout: 30000,
      });

      const wpContent = await page.content();

      if (wpContent.includes('"id":') && wpContent.includes('"title":')) {
        // We found WordPress API content!
        console.log("Found WordPress API content");

        // Parse JSON from the page
        const wpPosts = await page.evaluate(() => {
          try {
            return JSON.parse(document.body.innerText);
          } catch (e) {
            console.error("Error parsing WordPress API JSON:", e);
            return null;
          }
        });

        if (wpPosts && Array.isArray(wpPosts)) {
          // Generate RSS XML from WordPress API response
          const xmlContent = generateRssFromWpApi(wpPosts, baseUrl);
          return new Response(xmlContent, {
            headers: {
              "Content-Type": "application/xml",
            },
          });
        }
      }

      return NextResponse.json(
        { error: "URL does not contain a valid RSS feed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching feed with Playwright:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch feed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to escape XML
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper function to generate RSS from WordPress API
function generateRssFromWpApi(posts: WordPressPost[], baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">
  <channel>
    <title>${baseUrl.split("//")[1]}</title>
    <link>${baseUrl}</link>
    <description>Latest posts from ${baseUrl.split("//")[1]}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title?.rendered || "")}</title>
      <link>${post.link || ""}</link>
      <pubDate>${
        post.date ? new Date(post.date).toUTCString() : new Date().toUTCString()
      }</pubDate>
      <dc:creator>${escapeXml(post.author_name || "Author")}</dc:creator>
      <description>${escapeXml(post.excerpt?.rendered || "")}</description>
      <content:encoded>${escapeXml(
        post.content?.rendered || ""
      )}</content:encoded>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;
}
