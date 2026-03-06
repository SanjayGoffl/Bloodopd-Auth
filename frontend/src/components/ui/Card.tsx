import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
}

export default function Card({ children, padding = true, className = "", ...rest }: CardProps) {
  return (
    <div className={`card ${padding ? "p-5" : ""} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold text-gray-900 ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`mt-1 text-sm text-gray-500 ${className}`}>{children}</p>;
}
