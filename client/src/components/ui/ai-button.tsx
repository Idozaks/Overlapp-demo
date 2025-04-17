import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

// AI button specific styles that highlight its AI nature with purple accents
const aiButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow hover:from-purple-700 hover:to-violet-600 focus:ring-2 focus:ring-purple-500/50 flex gap-2",
        outline:
          "border border-purple-500 text-purple-600 hover:bg-purple-50 flex gap-2",
        ghost:
          "text-purple-600 hover:bg-purple-50 flex gap-2",
        link: "text-purple-600 underline-offset-4 hover:underline flex gap-2",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

const AIButton = React.forwardRef<HTMLButtonElement, AIButtonProps>(
  ({ className, variant, size, asChild = false, showSparkles = true, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(aiButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {showSparkles && <Sparkles className="h-4 w-4" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

AIButton.displayName = "AIButton";

export { AIButton, aiButtonVariants };