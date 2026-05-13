import React from "react";
import { render, act } from "@testing-library/react";
import { useEscapeKey } from "@/hooks/use-escape-key";

function HookProbe({ handler }: { handler: () => void }) {
  useEscapeKey(handler);
  return null;
}

describe("useEscapeKey", () => {
  it("fires the handler when Escape is pressed", () => {
    const handler = vi.fn();
    render(<HookProbe handler={handler} />);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire for other keys", () => {
    const handler = vi.fn();
    render(<HookProbe handler={handler} />);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("cleans up the listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = render(<HookProbe handler={handler} />);
    unmount();

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
