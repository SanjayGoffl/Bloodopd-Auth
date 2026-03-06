import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-md px-10 text-white">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-xl font-bold">TX</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">
            Blood Bank Transfusion Safety System
          </h1>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            TetherX provides healthcare-grade transfusion safety with dual-operator
            verification, ABO compatibility checks, bedside verification, and
            comprehensive audit trails.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {[
              "Dual-Operator Verification",
              "ABO Compatibility Engine",
              "Bedside 5-Step Check",
              "Real-time Monitoring",
              "Emergency O-Neg Release",
              "Full Audit Trail",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-medical-400 shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              TX
            </div>
            <span className="text-lg font-semibold text-gray-900">TetherX</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-1 text-sm text-gray-500 mb-6">
            Enter your credentials or use a demo account
          </p>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-gray-400">
            VIT-TetherX Hackathon &middot; Demo Environment &middot; No real patient data
          </p>
        </div>
      </div>
    </div>
  );
}
