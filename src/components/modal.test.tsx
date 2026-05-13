import React from "react";
import { render, screen, act } from "@testing-library/react";
import { Modal } from "@/components/modal";

describe("Modal", () => {
  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll while open and restores it on close", () => {
    const { unmount } = render(
      <Modal title="Test Modal" onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("auto-focuses the first focusable element (× button) on open", () => {
    render(
      <Modal title="Test Modal" onClose={() => {}}>
        <button>Inner Action</button>
      </Modal>,
    );

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Close modal" }),
    );
  });

  it("renders title and children", () => {
    render(
      <Modal title="My Dialog" onClose={() => {}}>
        <p>Hello world</p>
      </Modal>,
    );

    expect(screen.getByText("My Dialog")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });
});
