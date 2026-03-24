"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";

export default function SetupPage() {
  const router = useRouter();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => setNeedsSetup(data.needsSetup))
      .catch(() => setNeedsSetup(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }

    setLoading(false);
  }

  if (needsSetup === null) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-white">
        <DHLHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#888] text-sm animate-pulse">Checking setup status...</div>
        </div>
      </div>
    );
  }

  if (!needsSetup) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-white">
        <DHLHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1a1a1a] mb-2">Setup Complete</div>
            <p className="text-sm text-[#555] mb-4">A manager account already exists.</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      <DHLHeader />
      <div className="flex-1 flex items-start md:items-center justify-center bg-white px-4 py-8 md:py-16">
        <div className="w-full max-w-sm">
          <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm">
            <div className="px-6 pt-6 pb-2">
              <h1 className="text-[#1a1a1a] text-lg font-bold">First-Time Setup</h1>
              <p className="text-xs text-[#555] mt-1">Create your manager account to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="displayName" className="text-[13px] text-[#333] font-medium">
                  Your Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. JP"
                  required
                  className="bg-white border border-[#ccc] rounded-[2px] px-3 text-base md:text-[13px] py-2.5 md:py-1.5 text-[#1a1a1a] placeholder-[#aaa] outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-[13px] text-[#333] font-medium">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jp"
                  required
                  className="bg-white border border-[#ccc] rounded-[2px] px-3 text-base md:text-[13px] py-2.5 md:py-1.5 text-[#1a1a1a] placeholder-[#aaa] outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[13px] text-[#333] font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="bg-white border border-[#ccc] rounded-[2px] px-3 text-base md:text-[13px] py-2.5 md:py-1.5 text-[#1a1a1a] placeholder-[#aaa] outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition"
                />
              </div>

              {message && (
                <div className={`text-sm px-3 py-2 rounded-[2px] border ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-[#D40511]"
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#D40511] hover:bg-[#b8040e] active:bg-[#9a030c] disabled:opacity-60 disabled:cursor-not-allowed text-white border border-[#9a030c] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
              >
                {loading ? "Creating..." : "Create Manager Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
