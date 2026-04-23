"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    const payload = {
      languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
      path: `${window.location.pathname}${window.location.search}`,
      platform: navigator.platform || null,
      referer: document.referrer || null,
      screen: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };

    void fetch("/api/visits", {
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).catch(() => undefined);
  }, []);

  return null;
}
