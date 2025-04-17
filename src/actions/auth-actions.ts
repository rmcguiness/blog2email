"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || "",
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  if (formData.get("remember-me") === "on") {
    const expirationTime = 60 * 60 * 24 * 30; // 30 days in seconds

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      redirect("/error");
    }

    (await cookies()).set("session", session.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + expirationTime * 1000),
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const { email, password, passwordConfirm } = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    passwordConfirm: formData.get("passwordConfirm") as string,
  };
  if (!email || !password || !passwordConfirm) {
    return { error: "Please fill in all fields" };
  }
  if (password !== passwordConfirm) {
    return { error: "Passwords do not match" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { user: data.user, error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export const getUser = async () => {
  // Get additional user data if needed
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  console.log(data);
  return { data, error };
};
