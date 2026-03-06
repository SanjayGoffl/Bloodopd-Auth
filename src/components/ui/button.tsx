"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "emergency";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600":
              variant === "default",
            "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600":
              variant === "destructive",
            "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50":
              variant === "outline",
            "text-gray-700 hover:bg-gray-100": variant === "ghost",
            "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-700 border-2 border-red-400 shadow-lg":
              variant === "emergency",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
