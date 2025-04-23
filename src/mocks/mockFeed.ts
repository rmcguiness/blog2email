export const mockFeedData = {
  items: [
    {
      title: "Test Blog Post",
      link: "https://example.com/test-post",
      pubDate: new Date().toISOString(),
      content: "<p>This is a test blog post content.</p>",
      contentSnippet: "This is a test blog post content.",
    },
  ],
};

export async function getMockFeed() {
  return mockFeedData;
}
