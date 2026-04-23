"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.hidden || isEditingFormField()) {
        return;
      }

      router.refresh();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [router]);

  return null;
}

function isEditingFormField() {
  const activeElement = document.activeElement;

  if (!activeElement) {
    return false;
  }

  return ["INPUT", "SELECT", "TEXTAREA"].includes(activeElement.tagName);
}
