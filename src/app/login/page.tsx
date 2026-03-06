"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Droplets,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Lock,
  ChevronLeft,
  Activity,
} from "lucide-react";
import { loginAction, verifyMfaAction } from "./actions";

type Step = "credentials" | "mfa";

const ROLE_LABELS: Record<string, string> = {
  hod: "Head of Department",
  officer: "Blood Bank Officer",
  lab_tech: "Laboratory Technician",
  clinician: "Clinician",
  nurse: "Nurse",
};

const DEMO_USERS = [
  { label: "HOD", email: "hod@hospital.in" },
  { label: "Officer", email: "officer@hospital.in" },
  { label: "Lab Tech", email: "labtech@hospital.in" },
  { label: "Clinician", email: "clinician@hospital.in" },
  { label: "Nurse", email: "nurse@hospital.in" },
];

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [pendingRole, setPendingRole] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "mfa") {
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await loginAction(email, password);

      if (!result.ok) {
        setFailedAttempts((n) => n + 1);
        setError(result.error);
        return;
      }

      if (result.mfa_required) {
        setPendingRole(result.role);
        setStep("mfa");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleMFA(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const code = totp.join("");

    startTransition(async () => {
      const result = await verifyMfaAction(email, password, code);

      if (!result.ok) {
        setError(result.error);
        setTotp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...totp];
    next[index] = digit;
    setTotp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !totp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Demo@1234");
    setError("");
  }

  const totpComplete = totp.every((d) => d !== "");
  const loading = isPending;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-b from-rose-950 via-red-900 to-slate-900 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-800/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-rose-900/20 blur-3xl" />

        {/* Top logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <Droplets className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <div className="text-white font-bold tracking-wide text-sm">TETHERX</div>
              <div className="text-red-300/70 text-xs tracking-widest uppercase">Blood Bank</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Transfusion<br />
            <span className="text-red-300">Safety System</span>
          </h1>
          <p className="text-red-200/60 text-sm leading-relaxed max-w-xs">
            A zero-trust clinical platform for blood bank management, dual-verification issue authorization, and haemovigilance.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: ShieldCheck, label: "Dual-Operator Verification", sub: "Every issue requires two authorized staff" },
            { icon: Activity,    label: "Real-Time Haemovigilance",   sub: "Adverse reactions tracked and reported" },
            { icon: Lock,        label: "Role-Based Access Control",   sub: "5 clinical roles, strict permissions" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">{label}</div>
                <div className="text-red-200/50 text-xs mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-red-200/30 text-xs">
          VIT-TetherX &copy; 2026 &middot; Clinical Build
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6 lg:hidden">
                  <Droplets className="w-5 h-5 text-red-500" />
                  <span className="text-white font-bold text-sm tracking-wide">TETHERX Blood Bank</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Staff Sign In</h2>
                <p className="text-slate-400 text-sm">Authorized hospital personnel only.</p>
              </div>

              {failedAttempts >= 3 && (
                <div className="mb-5 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-300 text-sm">
                    Multiple failed attempts. Account will lock after 5 failures.
                  </p>
                </div>
              )}

              {/* Quick-fill demo pills */}
              <div className="mb-6">
                <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Demo — Quick Fill</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => fillDemo(u.email)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-red-500/50 hover:text-red-300 transition-colors"
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Hospital Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.in"
                    required
                    autoComplete="email"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-colors mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Verifying credentials…
                    </span>
                  ) : (
                    <>Continue <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-6">
                All access attempts are logged and audited.<br />
                Unauthorized access will be reported to compliance.
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button
                  onClick={() => { setStep("credentials"); setError(""); setTotp(["","","","","",""]); }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Two-Factor Verification</h2>
                <p className="text-slate-400 text-sm">
                  Required for{" "}
                  <span className="text-white font-medium">
                    {pendingRole ? ROLE_LABELS[pendingRole] : "your role"}
                  </span>.{" "}
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              <form onSubmit={handleMFA} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Verification Code
                  </label>
                  <div className="flex gap-3 justify-between">
                    {totp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="flex-1 h-14 text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors caret-transparent"
                      />
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Demo: enter any 6 digits (e.g. 1 2 3 4 5 6)
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !totpComplete}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Verifying…
                    </span>
                  ) : (
                    <>Verify &amp; Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
