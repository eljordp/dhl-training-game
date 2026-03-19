"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(username, password);

    if (signInError) {
      setError("Invalid username or password");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* DHL Header */}
      <header className="bg-[#FFCC00] px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 flex-shrink-0 border-b border-[#e6b800]">
        <div className="bg-[#D40511] rounded-[4px] px-2 md:px-3 py-0.5 flex items-center">
          <span
            className="text-white font-black text-xl md:text-3xl italic tracking-tight leading-none"
            style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
          >
            DHL
          </span>
        </div>
        <span className="text-[#1a1a1a] font-bold text-base md:text-xl tracking-tight">
          Training Simulator
        </span>
      </header>

      {/* Page body */}
      <div className="flex-1 flex items-start md:items-center justify-center bg-white px-4 py-8 md:py-16">
        <div className="w-full max-w-sm">
          {/* Login Card */}
          <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm">
            <div className="px-6 pt-6 pb-2">
              <h1 className="text-[#1a1a1a] text-lg font-bold">
                Employee Login
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-4">
              {/* Username field */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="username"
                  className="text-[13px] text-[#333] font-medium"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white border border-[#ccc] rounded-[2px] px-3 text-base md:text-[13px] py-2.5 md:py-1.5 text-[#1a1a1a] placeholder-[#aaa] outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition"
                />
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="password"
                  className="text-[13px] text-[#333] font-medium"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border border-[#ccc] rounded-[2px] px-3 text-base md:text-[13px] py-2.5 md:py-1.5 text-[#1a1a1a] placeholder-[#aaa] outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-[#D40511] text-[13px]">{error}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] disabled:opacity-60 disabled:cursor-not-allowed text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
              >
                {loading ? "Signing in..." : "SIGN IN"}
              </button>

              {/* Helper text */}
              <p className="text-[11px] text-[#aaa] text-center">
                Forgot your password? Contact your manager.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
