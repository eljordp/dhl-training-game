"use client";

import { useEffect, useRef } from "react";
import { ActivityTracker } from "./activityTracker";

export function useActivityTracker(page: string): void {
  const trackerRef = useRef<ActivityTracker | null>(null);

  useEffect(() => {
    const tracker = ActivityTracker.getInstance();
    trackerRef.current = tracker;
    tracker.start(page);

    return () => {
      tracker.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update page when it changes (without restarting)
  useEffect(() => {
    if (trackerRef.current) {
      trackerRef.current.setPage(page);
    }
  }, [page]);
}
