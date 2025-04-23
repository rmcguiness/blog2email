import { GET } from "../src/app/api/cron/check-feeds/route";

// Mock request object
const mockRequest = new Request(
  `http://localhost:3000/api/cron/check-feeds?apiKey=${encodeURIComponent(
    process.env.CRON_API_KEY || ""
  )}`
);

async function testCron() {
  console.log("Testing cron job...");
  try {
    const response = await GET(mockRequest);
    const data = await response.json();
    console.log("Cron job response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error testing cron job:", error);
  }
}

testCron();
