import React, { useRef } from "react";
import { render, act } from "@testing-library/react";
import { useFocusTrap } from "@/hooks/use-focus-trap";

function TrapContainer() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);

  return (
    <div ref={ref}>
      <button>First</button>
      <button>Middle</button>
      <button>Last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("wraps Tab forward from the last element to the first", () => {
    const { getByText } = render(<TrapContainer />);
    const first = getByText("First");
    const last = getByText("Last");

    last.focus();
    expect(document.activeElement).toBe(last);

    act(() => {
      last.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    expect(document.activeElement).toBe(first);
  });

  it("wraps Shift+Tab backward from the first element to the last", () => {
    const { getByText } = render(<TrapContainer />);
    const first = getByText("First");
    const last = getByText("Last");

    first.focus();
    expect(document.activeElement).toBe(first);

    act(() => {
      first.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    expect(document.activeElement).toBe(last);
  });
});
