// src/components/ui/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
            primary: "bg-blue-500 text-white hover:bg-blue-600",
            secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
            destructive: "bg-red-500 text-white hover:bg-red-600",
          }[variant],
          {
            default: "px-4 py-2",
            sm: "px-3 py-1 text-sm",
            lg: "px-6 py-3 text-lg",
          }[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
