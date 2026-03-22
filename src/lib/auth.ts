"use client";

import { UserProfile } from "@/types/auth";

export async function signIn(
  username: string,
  password: string
): Promise<{ data: { profile: UserProfile } | null; error: { message: string } | null }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { data: null, error: { message: json.error || "Login failed" } };
    }

    return { data: { profile: json.profile }, error: null };
  } catch {
    return { data: null, error: { message: "Network error" } };
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // fail silently
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch("/api/auth/me");
    const json = await res.json();
    return json.profile ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  return getProfile();
}
