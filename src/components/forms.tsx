import React, {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { tokens } from "@/components/design-tokens";

type MessageType = "success" | "error";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

type FieldProps = {
  label: string;
  value?: ReactNode;
};

type FormFieldProps = {
  label: ReactNode;
  htmlFor?: string;
  error?: ReactNode;
  children: ReactNode;
};

type FormMessageProps = {
  type: MessageType;
  children: ReactNode;
  className?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, className, ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      aria-invalid={error || undefined}
      className={cx(tokens.input.base, error && tokens.input.error, className)}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error = false, className, ...props }, ref) {
    return (
      <textarea
        {...props}
        ref={ref}
        aria-invalid={error || undefined}
        className={cx(tokens.input.base, error && tokens.input.error, className)}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error = false, className, ...props }, ref) {
    return (
      <select
        {...props}
        ref={ref}
        aria-invalid={error || undefined}
        className={cx(tokens.input.base, error && tokens.input.error, className)}
      />
    );
  },
);

export function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export function FormMessage({
  type,
  children,
  className,
}: FormMessageProps) {
  return (
    <div
      className={cx(
        "rounded-md border px-4 py-3 text-sm",
        type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700",
        className,
      )}
    >
      {children}
    </div>
  );
}
