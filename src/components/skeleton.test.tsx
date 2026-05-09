import React from "react";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/skeleton";

describe("Skeleton", () => {
  it("renders an animated placeholder with aria-hidden", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');

    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("accepts width, height, and className overrides", () => {
    const { container } = render(
      <Skeleton width={120} height="2rem" className="rounded-full" />,
    );
    const skeleton = container.querySelector('[data-slot="skeleton"]');

    expect(skeleton).toHaveStyle({ width: "120px", height: "2rem" });
    expect(skeleton).toHaveClass("rounded-full");
  });
});
