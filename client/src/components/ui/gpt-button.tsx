import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface GptButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const GptButton = React.forwardRef<HTMLButtonElement, GptButtonProps>(
  ({ className, children, isLoading, loadingText, disabled, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          
          // Default state (teal) - applied only when not in outline or secondary variants
          variant === "default" && !isLoading && "bg-teal-cta text-white hover:bg-teal-cta-hover active:bg-teal-cta-pressed",
          
          // Loading state (amber) - applied only when not in outline or secondary variants
          variant === "default" && isLoading && "bg-amber-active text-white hover:bg-amber-active-hover active:bg-amber-active-pressed",
          
          // Outline variant
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          
          // Secondary variant
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          
          // Destructive variant
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          
          // Ghost variant
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          
          // Link variant
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          
          // Size styles
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",
          
          // Animation styles if not in outline/secondary
          variant === "default" && "active:animate-scale-down hover:animate-scale-up",
          
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