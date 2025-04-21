"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return { error: error.message };
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
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export const getUser = async () => {
  // Get additional user data if needed
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  console.log(data);
  return { data, error };
};
