import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface GptButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

const GptButton = React.forwardRef<HTMLButtonElement, GptButtonProps>(
  ({ className, children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "bg-teal-cta text-white hover:bg-teal-cta-hover active:bg-teal-cta-pressed active:animate-scale-down hover:animate-scale-up relative overflow-hidden px-4 py-2",
          isLoading && "bg-amber-active hover:bg-amber-active-hover active:bg-amber-active-pressed",
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spinner" />
            {loadingText || "Loading..."}
          </>
        ) : (
          <>{children}</>
        )}
      </button>
    );
  }
);

GptButton.displayName = "GptButton";

export { GptButton };