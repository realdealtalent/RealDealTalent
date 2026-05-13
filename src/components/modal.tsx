"use client";

import React, { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { Button } from "@/components/button";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ title, onClose, children, className }: ModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef);
  useEscapeKey(onClose);

  // Lock body scroll while open, restore on close
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Auto-focus first focusable child on open
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const focusable = container.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white rounded-lg shadow-xl w-full mx-4 ${className ?? "max-w-lg"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close modal"
            className="min-h-0 px-2 py-1 text-xl leading-none text-gray-400 hover:bg-transparent hover:text-gray-600"
          >
            &times;
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
