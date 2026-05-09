import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/button";

describe("Button", () => {
  it("renders the accessible name", () => {
    render(<Button>Save Filters</Button>);

    expect(
      screen.getByRole("button", { name: "Save Filters" }),
    ).toBeInTheDocument();
  });

  it("renders every variant", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(
      screen.getByRole("button", { name: "Secondary" }),
    ).toBeInTheDocument();

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole("button", { name: "Danger" })).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
  });

  it("blocks clicks when disabled", () => {
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires onClick when enabled", () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Click" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a spinner and disables while loading", () => {
    const { container } = render(<Button loading>Creating</Button>);
    const button = screen.getByRole("button", { name: "Creating" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[data-slot="spinner"]')).toBeTruthy();
  });

  it("keeps the label text while loading", () => {
    render(<Button loading>Creating</Button>);

    expect(
      screen.getByRole("button", { name: "Creating" }),
    ).toBeInTheDocument();
  });

  it("forwards standard button props and refs", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <Button ref={ref} type="submit" data-testid="submit-button">
        Submit
      </Button>,
    );

    const button = screen.getByTestId("submit-button");
    expect(button).toHaveAttribute("type", "submit");
    expect(ref.current).toBe(button);
  });
});
