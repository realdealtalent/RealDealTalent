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

  it("renders a spinner and disables while loading", () => {
    const { container } = render(<Button loading>Creating</Button>);
    const button = screen.getByRole("button", { name: "Creating" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[data-slot="spinner"]')).toBeTruthy();
  });
});
