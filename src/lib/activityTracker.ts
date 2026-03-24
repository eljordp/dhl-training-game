/**
 * Client-side activity tracker singleton.
 * Monitors user activity (active / idle / away) and sends heartbeats every 30s.
 */

const IDLE_TIMEOUT_MS = 60_000; // 60 seconds of no activity = idle
const HEARTBEAT_INTERVAL_MS = 30_000; // send heartbeat every 30s
const THROTTLE_MS = 2_000; // sample interactions every 2s

type ActivityState = "active" | "idle" | "away";

export class ActivityTracker {
  static instance: ActivityTracker | null = null;

  private page = "";
  private state: ActivityState = "active";
  private focused = true;

  // Counters (reset after each heartbeat)
  private activeMs = 0;
  private idleMs = 0;
  private awayMs = 0;
  private interactions = 0;

  // Timers
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTick = Date.now();
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  // Throttle
  private lastInteractionTs = 0;

  // Bound handlers for cleanup
  private handleActivity: () => void;
  private handleVisibility: () => void;
  private handleFocus: () => void;
  private handleBlur: () => void;
  private handleUnload: () => void;

  private started = false;

  private constructor() {
    this.handleActivity = this.onActivity.bind(this);
    this.handleVisibility = this.onVisibilityChange.bind(this);
    this.handleFocus = this.onFocus.bind(this);
    this.handleBlur = this.onBlur.bind(this);
    this.handleUnload = this.onUnload.bind(this);
  }

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  start(page: string): void {
    if (this.started) {
      this.setPage(page);
      return;
    }

    this.page = page;
    this.started = true;
    this.resetCounters();
    this.lastTick = Date.now();

    // Activity listeners
    const events = ["keydown", "mousemove", "scroll", "click", "touchstart"] as const;
    for (const evt of events) {
      document.addEventListener(evt, this.handleActivity, { passive: true });
    }

    // Visibility / focus listeners
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("focus", this.handleFocus);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("beforeunload", this.handleUnload);

    // Start idle timer
    this.resetIdleTimer();

    // Tick every second to accumulate time in the right bucket
    this.tickTimer = setInterval(() => this.tick(), 1_000);

    // Heartbeat every 30s
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  stop(): void {
    if (!this.started) return;

    // Send final heartbeat
    this.sendHeartbeat();

    // Remove listeners
    const events = ["keydown", "mousemove", "scroll", "click", "touchstart"] as const;
    for (const evt of events) {
      document.removeEventListener(evt, this.handleActivity);
    }
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("focus", this.handleFocus);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("beforeunload", this.handleUnload);

    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.tickTimer) clearInterval(this.tickTimer);

    this.heartbeatTimer = null;
    this.idleTimer = null;
    this.tickTimer = null;
    this.started = false;
  }

  setPage(page: string): void {
    if (this.page !== page) {
      // Send heartbeat for previous page before switching
      this.sendHeartbeat();
      this.page = page;
    }
  }

  // --- Private ---

  private onActivity(): void {
    const now = Date.now();

    // Throttle interaction counting
    if (now - this.lastInteractionTs >= THROTTLE_MS) {
      this.interactions++;
      this.lastInteractionTs = now;
    }

    // Reset idle: go back to active
    if (this.state === "idle") {
      this.state = "active";
    }
    this.resetIdleTimer();
  }

  private onVisibilityChange(): void {
    if (document.hidden) {
      this.state = "away";
      this.focused = false;
    } else {
      this.state = "active";
      this.focused = true;
      this.resetIdleTimer();
    }
  }

  private onFocus(): void {
    this.state = "active";
    this.focused = true;
    this.resetIdleTimer();
  }

  private onBlur(): void {
    this.state = "away";
    this.focused = false;
  }

  private onUnload(): void {
    this.sendHeartbeat(true);
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.state === "active") {
        this.state = "idle";
      }
    }, IDLE_TIMEOUT_MS);
  }

  private tick(): void {
    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    switch (this.state) {
      case "active":
        this.activeMs += delta;
        break;
      case "idle":
        this.idleMs += delta;
        break;
      case "away":
        this.awayMs += delta;
        break;
    }
  }

  private resetCounters(): void {
    this.activeMs = 0;
    this.idleMs = 0;
    this.awayMs = 0;
    this.interactions = 0;
    this.lastTick = Date.now();
  }

  private sendHeartbeat(beacon = false): void {
    // Final tick to capture remaining time
    this.tick();

    const payload = {
      page: this.page,
      activeSeconds: Math.round(this.activeMs / 1000),
      idleSeconds: Math.round(this.idleMs / 1000),
      awaySeconds: Math.round(this.awayMs / 1000),
      focused: this.focused,
      interactions: this.interactions,
    };

    // Don't send empty heartbeats (all zeros)
    if (payload.activeSeconds === 0 && payload.idleSeconds === 0 && payload.awaySeconds === 0 && payload.interactions === 0) {
      return;
    }

    this.resetCounters();

    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/tracking/activity",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    } else {
      fetch("/api/tracking/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // fail silently
      });
    }
  }
}
