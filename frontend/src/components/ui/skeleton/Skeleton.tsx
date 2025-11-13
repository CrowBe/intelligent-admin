import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

function Skeleton({ className, ...props }: SkeletonProps): React.ReactElement {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
