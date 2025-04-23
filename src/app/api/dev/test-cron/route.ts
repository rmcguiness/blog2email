import { NextResponse } from "next/server";
import { GET as checkFeeds } from "../../cron/check-feeds/route";

// Only available in development
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Only available in development" },
      { status: 403 }
    );
  }
  // Create a mock request
  const mockRequest = new Request(
    `http://localhost:3000/api/cron/check-feeds?apiKey=${encodeURIComponent(
      process.env.CRON_API_KEY || ""
    )}`
  );
  // Run the cron job
  try {
    const response = await checkFeeds(mockRequest);
    const data = await response.json();
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("Error running cron test:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
