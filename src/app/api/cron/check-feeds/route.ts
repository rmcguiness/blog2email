import { NextResponse } from "next/server";
import {
  fetchFeedWithPlaywright,
  extractDescription,
  getPublicationDate,
  CustomItem,
} from "@/lib/rss";
import { sendEmail, formatBlogPostEmail } from "@/lib/email";
import { createClient } from "@/utils/supabase/server";
// This would be called by a scheduled job (e.g., Vercel Cron or external service)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    // Security check - in production, you'd implement a proper API key verification
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey");

    if (apiKey !== process.env.CRON_API_KEY) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Get all blogs that need to be checked
    const { data: blogs, error: blogsError } = await supabase
      .from("blogs")
      .select("*");

    if (blogsError) {
      console.error("Error fetching blogs:", blogsError);
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch blogs" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!blogs || blogs.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No blogs to check" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const results = [];

    // Process each blog
    for (const blog of blogs) {
      try {
        // Update the last_checked timestamp
        await supabase
          .from("blogs")
          .update({ last_checked: new Date().toISOString() })
          .eq("id", blog.id);

        // Fetch the feed
        const feed = await fetchFeedWithPlaywright(blog.feed_url);

        if (!feed || !feed.items || feed.items.length === 0) {
          results.push({ blog: blog.title, status: "No new items found" });
          continue;
        }

        // Sort items by date (newest first)
        const sortedItems = feed.items.sort((a: CustomItem, b: CustomItem) => {
          return (
            getPublicationDate(b).getTime() - getPublicationDate(a).getTime()
          );
        });

        // Get the latest post
        const latestPost = sortedItems[0];
        const latestPostDate = getPublicationDate(latestPost);

        // Check if we've already processed this post
        const { data: existingPosts } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("blog_id", blog.id)
          .eq("url", latestPost.link);

        if (existingPosts && existingPosts.length > 0) {
          results.push({
            blog: blog.title,
            status: "Post already processed",
            post: latestPost.title,
          });
          continue;
        }

        // Check if this post is newer than the last one we've seen
        if (
          blog.last_post_date &&
          new Date(blog.last_post_date) >= latestPostDate
        ) {
          results.push({
            blog: blog.title,
            status: "No new posts since last check",
            lastChecked: blog.last_post_date,
          });
          continue;
        }

        // It's a new post! Insert it into the database
        const { data: newPost, error: insertError } = await supabase
          .from("blog_posts")
          .insert({
            blog_id: blog.id,
            title: latestPost.title,
            description: extractDescription(latestPost),
            url: latestPost.link,
            published_at: latestPostDate.toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting new post:", insertError);
          results.push({
            blog: blog.title,
            status: "Error inserting new post",
            error: insertError.message,
          });
          continue;
        }

        // Update the blog's last post date
        await supabase
          .from("blogs")
          .update({ last_post_date: latestPostDate.toISOString() })
          .eq("id", blog.id);

        // Get the user's email
        const { data: user } = await supabase
          .from("profiles") // Assuming you have a profiles table
          .select("email")
          .eq("id", blog.user_id)
          .single();

        if (!user || !user.email) {
          results.push({
            blog: blog.title,
            status: "User email not found",
            post: newPost.title,
          });
          continue;
        }

        // Send an email notification
        const emailHtml = formatBlogPostEmail(
          blog.title,
          newPost.title,
          newPost.description,
          newPost.url
        );

        const emailResult = await sendEmail({
          to: user.email,
          subject: `New Post: ${newPost.title}`,
          html: emailHtml,
        });

        if (emailResult.success) {
          // Update the post with the sent timestamp
          await supabase
            .from("blog_posts")
            .update({ sent_at: new Date().toISOString() })
            .eq("id", newPost.id);

          results.push({
            blog: blog.title,
            status: "Email sent successfully",
            post: newPost.title,
            messageId: emailResult.messageId,
          });
        } else {
          results.push({
            blog: blog.title,
            status: "Error sending email",
            post: newPost.title,
            error: emailResult.error,
          });
        }
      } catch (error) {
        console.error(`Error processing blog ${blog.title}:`, error);
        results.push({
          blog: blog.title,
          status: "Error processing blog",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new NextResponse(
      JSON.stringify({
        processed: blogs.length,
        results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in cron job:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
