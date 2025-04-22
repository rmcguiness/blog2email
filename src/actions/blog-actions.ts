"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBlogSubscription(blogData: {
  title: string;
  url: string;
  feed_url: string;
  userId: string;
}) {
  const supabase = await createClient();

  try {
    // Check if blog exists
    const { data: existingBlog, error: fetchError } = await supabase
      .from("blogs")
      .select("*")
      .eq("url", blogData.url)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return {
        error: `Error checking for existing blog: ${fetchError.message}`,
      };
    }

    if (existingBlog) {
      // Check if user is already subscribed
      // Using a manual array check instead of Array.includes()
      let isAlreadySubscribed = false;
      const currentUserIds = existingBlog.user_id || [];

      if (Array.isArray(currentUserIds)) {
        for (let i = 0; i < currentUserIds.length; i++) {
          if (currentUserIds[i] === blogData.userId) {
            isAlreadySubscribed = true;
            break;
          }
        }
      }

      if (isAlreadySubscribed) {
        return { success: "You are already subscribed to this blog!" };
      }

      // Create a new array with the user ID added
      const updatedUserIds = Array.isArray(currentUserIds)
        ? [...currentUserIds, blogData.userId]
        : [blogData.userId];

      // Update the blog
      const { error: updateError } = await supabase
        .from("blogs")
        .update({
          user_id: updatedUserIds,
        })
        .eq("id", existingBlog.id);

      if (updateError) {
        return {
          error: `Error updating blog: ${updateError.message}`,
        };
      }

      // Revalidate the dashboard path
      revalidatePath("/dashboard");
      return { success: "Successfully subscribed to this blog!" };
    } else {
      // Insert new blog
      const { error: insertError } = await supabase.from("blogs").insert({
        title: blogData.title,
        url: blogData.url,
        feed_url: blogData.feed_url,
        user_id: [blogData.userId],
      });

      if (insertError) {
        return {
          error: `Error adding blog: ${insertError.message}`,
        };
      }

      // Revalidate the dashboard path
      revalidatePath("/dashboard");
      return { success: "Blog added successfully!" };
    }
  } catch (err) {
    console.error("Error in addBlogSubscription:", err);
    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
