import React from "react";
import { act, render, screen } from "@testing-library/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const QUERY = "(prefers-reduced-motion: reduce)";

type MatchMediaController = {
  setMatches: (nextValue: boolean) => void;
};

function installMatchMedia(initialValue: boolean): MatchMediaController {
  let matches = initialValue;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.add(listener);
      },
      removeEventListener: (
        _type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => true,
    }),
  });

  return {
    setMatches(nextValue: boolean) {
      matches = nextValue;
      const event = { matches: nextValue, media: QUERY } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function HookProbe() {
  const prefersReducedMotion = useReducedMotion();

  return <div>{prefersReducedMotion ? "reduce" : "no-reduce"}</div>;
}

describe("useReducedMotion", () => {
  it("returns the current matchMedia value", () => {
    installMatchMedia(true);

    render(<HookProbe />);

    expect(screen.getByText("reduce")).toBeInTheDocument();
  });

  it("updates when the media query changes", () => {
    const mediaQuery = installMatchMedia(false);

    render(<HookProbe />);
    expect(screen.getByText("no-reduce")).toBeInTheDocument();

    act(() => {
      mediaQuery.setMatches(true);
    });

    expect(screen.getByText("reduce")).toBeInTheDocument();
  });
});
