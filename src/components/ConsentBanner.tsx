"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "dhl_activity_consent";
const CONSENT_CHECKED_KEY = "dhl_consent_checked";

export type ConsentStatus = "pending" | "accepted" | "declined";

/**
 * Check localStorage for cached consent status.
 * Returns "pending" if not yet decided.
 */
export function getCachedConsent(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === "accepted") return "accepted";
  if (val === "declined") return "declined";
  return "pending";
}

/**
 * Whether we've already checked the server for consent this session.
 */
function hasCheckedServer(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CONSENT_CHECKED_KEY) === "true";
}

interface ConsentBannerProps {
  onConsentChange?: (status: ConsentStatus) => void;
}

export default function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [status, setStatus] = useState<ConsentStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // On mount, check localStorage first, then verify with server
  useEffect(() => {
    const cached = getCachedConsent();

    if (cached !== "pending") {
      setStatus(cached);
      setLoading(false);
      onConsentChange?.(cached);

      // If we haven't verified with server this session, do it in background
      if (!hasCheckedServer()) {
        fetch("/api/consent")
          .then((r) => r.json())
          .then((data) => {
            sessionStorage.setItem(CONSENT_CHECKED_KEY, "true");
            const serverStatus: ConsentStatus = data.consent_given ? "accepted" : "pending";
            // Only update if server says accepted but local says declined (or vice versa)
            if (data.consent_given && cached !== "accepted") {
              localStorage.setItem(CONSENT_KEY, "accepted");
              setStatus("accepted");
              onConsentChange?.("accepted");
            }
          })
          .catch(() => {});
      }
      return;
    }

    // No cached value — check server
    fetch("/api/consent")
      .then((r) => r.json())
      .then((data) => {
        sessionStorage.setItem(CONSENT_CHECKED_KEY, "true");
        if (data.consent_given) {
          localStorage.setItem(CONSENT_KEY, "accepted");
          setStatus("accepted");
          onConsentChange?.("accepted");
        }
        // If not given, status stays "pending" and we show the banner
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConsent(accepted: boolean) {
    setSubmitting(true);

    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: accepted }),
      });
      await res.json();
    } catch {
      // Save locally even if server fails
    }

    const newStatus: ConsentStatus = accepted ? "accepted" : "declined";
    localStorage.setItem(CONSENT_KEY, newStatus);
    setStatus(newStatus);
    setSubmitting(false);
    onConsentChange?.(newStatus);
  }

  // Don't show anything while loading or if already decided
  if (loading || status !== "pending") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="bg-white rounded-sm shadow-lg border border-[#ddd] w-full max-w-lg"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
          <h2 className="font-bold text-[#1a1a1a] text-lg">Activity Tracking</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Main explanation */}
          <p className="text-sm text-[#333] leading-relaxed">
            This training platform tracks your activity to help your manager support your development.
          </p>

          {/* What we collect */}
          <div>
            <p className="text-xs font-bold text-[#555] uppercase tracking-wide mb-2">
              What we collect
            </p>
            <ul className="space-y-1.5">
              <li className="text-sm text-[#444] flex gap-2">
                <span className="text-[#D40511] flex-shrink-0">&#8226;</span>
                Time spent on assessments and training
              </li>
              <li className="text-sm text-[#444] flex gap-2">
                <span className="text-[#D40511] flex-shrink-0">&#8226;</span>
                Active time, idle time, and away time (tab focus)
              </li>
              <li className="text-sm text-[#444] flex gap-2">
                <span className="text-[#D40511] flex-shrink-0">&#8226;</span>
                Quiz scores and answers
              </li>
            </ul>
          </div>

          {/* What we DON'T collect */}
          <div>
            <p className="text-xs font-bold text-[#555] uppercase tracking-wide mb-2">
              What we do NOT collect
            </p>
            <ul className="space-y-1.5">
              <li className="text-sm text-[#444] flex gap-2">
                <span className="text-green-600 flex-shrink-0">&#10003;</span>
                Personal browsing or anything outside this app
              </li>
              <li className="text-sm text-[#444] flex gap-2">
                <span className="text-green-600 flex-shrink-0">&#10003;</span>
                Keystrokes, passwords, or personal data
              </li>
            </ul>
          </div>

          {/* Manager visibility */}
          <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-[3px] px-4 py-3">
            <p className="text-sm text-[#333]">
              <strong>Your manager can see</strong> your progress and engagement metrics from this training platform.
            </p>
          </div>

          {/* Decline note */}
          <p className="text-xs text-[#888]">
            If you decline, you can still use the app and take assessments. Your quiz scores will still be saved (that is the point of the assessment), but activity tracking (time, engagement) will be turned off.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => handleConsent(false)}
              disabled={submitting}
              className="flex-1 bg-white hover:bg-gray-50 text-[#555] border border-[#ccc] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={() => handleConsent(true)}
              disabled={submitting}
              className="flex-1 bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Accept"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
