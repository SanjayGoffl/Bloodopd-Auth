import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? "border-danger-500 focus:ring-danger-500" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
