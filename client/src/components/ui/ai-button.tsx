import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export const aiButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-sm hover:shadow-md hover:shadow-purple-900/20",
        outline: "border border-purple-300 bg-background hover:bg-purple-100 hover:text-purple-800 text-purple-700",
        secondary: "bg-purple-100 text-purple-900 hover:bg-purple-200",
        ghost: "hover:bg-purple-100 hover:text-purple-900 text-purple-800",
        link: "text-purple-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AIButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof aiButtonVariants> {
  asChild?: boolean;
  showSparkles?: boolean;
  loading?: boolean;
}

/**
 * AI Button component with distinctive purple styling that visually indicates AI-powered features
 * across the application. Includes optional sparkle icon and loading state.
 */
export const AIButton = React.forwardRef<HTMLButtonElement, AIButtonProps>(
  ({ className, variant, size, asChild = false, showSparkles = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(aiButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : showSparkles ? (
          <Sparkles className="mr-2 h-4 w-4" />
        ) : null}
        {children}
      </Comp>
    );
  }
);

AIButton.displayName = "AIButton";