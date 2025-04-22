import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let browser = null;

  try {
    // Launch browser
    browser = await chromium.launch();
    const page = await browser.newPage();

    // Set user agent
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });

    // Go to the URL
    await page.goto(url, { timeout: 30000, waitUntil: "networkidle" });

    // Extract feed links
    const feedLinks = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll(
          'link[type*="rss"], link[type*="atom"], link[rel="alternate"]'
        )
      );

      return links
        .map((link: Element) => {
          const attributes: Record<string, string> = {};
          for (const attr of link.attributes) {
            attributes[attr.name] = attr.value;
          }
          return attributes;
        })
        .filter((link) => {
          return (
            (link.type &&
              (link.type.includes("rss") || link.type.includes("atom"))) ||
            (link.rel === "alternate" &&
              link.type &&
              (link.type.includes("rss") || link.type.includes("atom")))
          );
        });
    });

    if (feedLinks.length > 0) {
      // Get base URL for resolving relative URLs
      const baseUrl = new URL(url).origin;

      // Process each feed link to get absolute URLs
      const absoluteFeedUrls = feedLinks
        .map((link) => {
          if (!link.href) return null;
          try {
            return new URL(link.href, baseUrl).toString();
          } catch (e) {
            console.error("Error processing feed link:", e);
            return null;
          }
        })
        .filter(Boolean);

      return NextResponse.json({
        feedUrls: absoluteFeedUrls,
        count: absoluteFeedUrls.length,
      });
    }

    // If no feed links found, check common paths
    // (similar to your current implementation)

    return NextResponse.json(
      {
        feedUrls: [],
        count: 0,
        message: "No feed URLs found",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error detecting feed:", error);
    return NextResponse.json(
      { error: "Failed to detect feed" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
