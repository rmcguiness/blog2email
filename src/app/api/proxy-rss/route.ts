import { NextRequest, NextResponse } from "next/server";

// // Function to sanitize XML content
// function sanitizeXml(xml: string): string {
//   // Replace standalone ampersands that aren't part of entities
//   // This regex looks for & that isn't followed by a named entity or numeric reference
//   return xml.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, "&amp;");
// }

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const withHeaders =
    request.nextUrl.searchParams.get("withHeaders") === "true";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Set up headers that encourage XML response
    const headers: HeadersInit = {};

    if (withHeaders) {
      headers["Accept"] =
        "application/rss+xml, application/xml, text/xml, application/atom+xml, */*;q=0.1";
      headers["User-Agent"] = "Mozilla/5.0 (compatible; RSSReader/1.0)";
    }

    // Fetch the RSS feed
    const response = await fetch(url, { headers });
    const contentType = response.headers.get("Content-Type");
    const text = await response.text();

    // Check if we got HTML
    if (text.trim().startsWith("<html") || text.includes("<!DOCTYPE html>")) {
      console.warn("Received HTML instead of XML/RSS");
    }

    // Return the content with original content type
    return new Response(text, {
      headers: {
        "Content-Type": contentType || "application/xml",
      },
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
