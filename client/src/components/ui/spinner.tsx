import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  color?: "teal" | "amber" | "white";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", color = "white", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    const colorClasses = {
      teal: "border-t-teal-cta",
      amber: "border-t-amber-active", 
      white: "border-t-white",
    };

    return (
      <div
        className={cn(
          "inline-block rounded-full border-2 border-transparent border-solid animate-spinner",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };