import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { tokens, type ButtonVariant } from "@/components/design-tokens";

type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-sm",
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cx(
          tokens.button.base,
          tokens.button[variant],
          sizeClasses[size],
          className,
        )}
      >
        {loading ? (
          <span
            aria-hidden="true"
            data-slot="spinner"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        <span>{children}</span>
      </button>
    );
  },
);
