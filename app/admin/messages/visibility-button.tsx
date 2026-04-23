"use client";

import { useTransition } from "react";

type VisibilityButtonProps = {
  action: () => Promise<void>;
  hiddenLabel: string;
  visibleLabel: string;
  isVisible: boolean;
};

export function VisibilityButton({
  action,
  hiddenLabel,
  visibleLabel,
  isVisible,
}: VisibilityButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={isVisible ? "admin-action-button is-danger" : "admin-action-button"}
      disabled={isPending}
      onClick={() => startTransition(() => void action())}
      type="button"
    >
      {isPending ? "\u5904\u7406\u4e2d..." : isVisible ? hiddenLabel : visibleLabel}
    </button>
  );
}
