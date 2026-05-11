import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Toast } from "@/components/toast";

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("auto-dismisses after the configured timeout", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast
        type="success"
        message="Saved successfully"
        autoDismissMs={500}
        onDismiss={onDismiss}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses when the close button is clicked", () => {
    const onDismiss = vi.fn();

    render(
      <Toast
        type="error"
        message="Login failed"
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("uses the correct live region role for each type", () => {
    const { rerender } = render(
      <Toast
        type="success"
        message="Saved successfully"
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");

    rerender(
      <Toast
        type="error"
        message="Save failed"
        onDismiss={() => {}}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Save failed");
  });

  it("keeps error toasts persistent by default", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast
        type="error"
        message="Login failed"
        onDismiss={onDismiss}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
