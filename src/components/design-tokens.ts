export const tokens = {
  button: {
    base: [
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ].join(" "),
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  },
  input: {
    base: [
      "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500",
    ].join(" "),
    error:
      "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:ring-red-500/20",
  },
} as const;

export type ButtonVariant = Exclude<keyof typeof tokens.button, "base">;
