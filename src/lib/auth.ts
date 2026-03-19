"use client";
import { createClient } from "./supabase";
import { UserProfile } from "@/types/auth";

// Username is stored as `username@dhl-training.local` internally
function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@dhl-training.local`;
}

export async function signIn(username: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data ?? null;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
