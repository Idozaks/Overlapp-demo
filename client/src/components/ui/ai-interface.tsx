import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { AIButton } from "@/components/ui/ai-button";

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
  title = "AI-Powered Feature",
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
    <Card
      className={cn(
        "overflow-hidden",
        gradient && "border-purple-200 bg-gradient-to-br from-white to-purple-50",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          {badge && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              {badge}
            </Badge>
          )}
        </div>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            </motion.div>
            <p className="text-muted-foreground">Processing your request...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </CardContent>
      
      {(actionLabel || footerContent) && (
        <CardFooter className="flex justify-between border-t bg-slate-50/50 px-6 py-4">
          {actionLabel && onAction && (
            <AIButton onClick={onAction} loading={loading}>
              {actionLabel}
            </AIButton>
          )}
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * AI Result component for displaying individual AI-generated results with subtle animations
 */
export function AIResult({ 
  children, 
  highlight = false,
  className 
}: { 
  children: React.ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border p-3",
        highlight ? "border-purple-200 bg-purple-50" : "border-slate-200 bg-white",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * AI Processing indicator for showing when AI is actively working
 */
export function AIProcessing({ text = "AI is processing..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-2 rounded-md border border-purple-100">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}