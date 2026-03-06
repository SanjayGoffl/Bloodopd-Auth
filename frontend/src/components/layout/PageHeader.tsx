import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, back, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-start justify-between">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
