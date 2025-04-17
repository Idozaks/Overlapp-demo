import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

interface AIInterfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  gradient?: boolean;
  children?: React.ReactNode;
  badge?: string;
  footerContent?: React.ReactNode;
}

/**
 * AI Interface component provides a consistent, modern UI for AI-related features
 * throughout the application with distinctive purple styling and animations.
 */
export function AIInterface({
  title,
  subtitle,
  loading = false,
  actionLabel,
  onAction,
  gradient = true,
  children,
  badge,
  footerContent,
  className,
  ...props
}: AIInterfaceProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-purple-200 overflow-hidden flex flex-col",
        gradient ? "bg-gradient-to-b from-white to-purple-50" : "bg-white",
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-purple-600 mt-1">{subtitle}</p>
              )}
            </div>
            {badge && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                {badge}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-purple-600 text-sm animate-pulse">
              AI is processing your request...
            </p>
          </div>
        ) : (
          children
        )}
      </div>

      {(actionLabel || footerContent) && (
        <div className="px-6 py-4 bg-purple-50 border-t border-purple-100 flex justify-between items-center">
          {footerContent}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AI Result component for displaying individual AI-generated results with subtle animations
 */
export function AIResult({ 
  children, 
  className, 
  highlight = false,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string; 
  highlight?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-4 rounded-md mb-3 border border-purple-100 bg-white transition-all",
        highlight ? "shadow-md border-purple-300" : "hover:border-purple-200 hover:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * AI Processing indicator for showing when AI is actively working
 */
export function AIProcessing({ text = "AI is processing..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-4 text-purple-700 gap-2">
      <div className="relative h-4 w-28">
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-1/3 rounded-full animate-ai-progress"></div>
          </div>
        </div>
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}