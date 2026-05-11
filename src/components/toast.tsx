"use client";

import React from "react";
import { useEffect } from "react";

type ToastType = "success" | "error";

type ToastProps = {
  type: ToastType;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
  className?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Toast({
  type,
  message,
  onDismiss,
  autoDismissMs = type === "success" ? 3000 : undefined,
  className,
}: ToastProps) {
  useEffect(() => {
    if (autoDismissMs == null) return;

    const timeoutId = window.setTimeout(() => {
      onDismiss();
    }, autoDismissMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoDismissMs, message, onDismiss]);

  return (
    <div
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      className={cx(
        "flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-sm",
        type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700",
        className,
      )}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-base leading-none opacity-70 transition-opacity hover:opacity-100"
      >
        &times;
      </button>
    </div>
  );
}
