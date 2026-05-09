import React, { type CSSProperties, type ComponentPropsWithoutRef } from "react";

type SkeletonProps = ComponentPropsWithoutRef<"div"> & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Skeleton({
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      data-slot="skeleton"
      className={cx("animate-pulse rounded-md bg-gray-200", className)}
      style={{ width, height, ...style }}
    />
  );
}
