import { type ButtonHTMLAttributes, forwardRef } from "react";

const variants: Record<string, string> = {
  primary: "btn btn-primary",
  danger: "btn btn-danger",
  outline: "btn btn-outline",
  ghost: "btn btn-ghost",
};

const sizes: Record<string, string> = {
  sm: "btn-sm",
  md: "",
  lg: "text-base px-6 py-3",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = "Button";
export default Button;
