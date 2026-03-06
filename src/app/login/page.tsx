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
  { label: "HOD", email: "hod@hospital.in", color: "border-purple-500/50 text-purple-300 bg-purple-500/10" },
  { label: "Officer", email: "officer@hospital.in", color: "border-blue-500/50 text-blue-300 bg-blue-500/10" },
  { label: "Lab Tech", email: "labtech@hospital.in", color: "border-green-500/50 text-green-300 bg-green-500/10" },
  { label: "Clinician", email: "clinician@hospital.in", color: "border-amber-500/50 text-amber-300 bg-amber-500/10" },
  { label: "Nurse", email: "nurse@hospital.in", color: "border-pink-500/50 text-pink-300 bg-pink-500/10" },
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
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
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
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Left panel — branding (hidden on small screens) */}
      <div className="hidden lg:flex w-[42%] bg-gradient-to-b from-rose-950 via-red-900 to-slate-900 p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-800/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-rose-900/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full w-full">
          {/* Logo & Top section */}
          <div className="mb-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-9 h-9 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
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
            <p className="text-red-200/70 text-sm leading-relaxed max-w-sm mb-10">
              A zero-trust clinical platform for blood bank management, dual-verification issue authorization, and haemovigilance.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-4">
              {[
                { icon: ShieldCheck, label: "Dual-Operator Verification", sub: "Every issue requires two authorized staff" },
                { icon: Activity, label: "Real-Time Haemovigilance", sub: "Adverse reactions tracked and reported" },
                { icon: Lock, label: "Role-Based Access Control", sub: "5 clinical roles, strict permissions" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/10">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-red-200/60 text-xs mt-1">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto text-red-200/30 text-xs font-medium tracking-wide">
            VIT-TetherX &copy; 2026 &middot; Clinical Build
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm">

          {step === "credentials" ? (
            <>
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-6 lg:hidden">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm tracking-wide">TETHERX Blood Bank</span>
              </div>

              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white mb-1">Staff Sign In</h2>
                <p className="text-slate-400 text-sm">Authorized hospital personnel only.</p>
              </div>

              {failedAttempts >= 3 && (
                <div className="mb-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-300 text-xs">
                    Multiple failed attempts. Account locks after 5 failures.
                  </p>
                </div>
              )}

              {/* Quick-fill demo pills */}
              <div className="mb-6">
                <p className="text-slate-500 text-[10px] mb-2.5 uppercase tracking-widest font-semibold">Demo / Quick Fill</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_USERS.map((u) => {
                    const isSelected = email === u.email;
                    return (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => fillDemo(u.email)}
                        className={`px-3 py-1.5 text-[11px] rounded-md border transition-all font-medium ${isSelected
                          ? u.color
                          : "text-slate-400 border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-slate-300 hover:border-slate-700"
                          }`}
                      >
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    Hospital Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.in"
                    required
                    autoComplete="email"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-colors"
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
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors mt-1"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Verifying…
                    </>
                  ) : (
                    <>Continue <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-5 leading-relaxed">
                All access attempts are logged and audited.<br />
                Unauthorized access will be reported to compliance.
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("credentials"); setError(""); setTotp(["", "", "", "", "", ""]); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to sign in
              </button>

              <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>

              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white mb-1">Two-Factor Auth</h2>
                <p className="text-slate-400 text-sm">
                  Required for{" "}
                  <span className="text-white font-medium">
                    {pendingRole ? ROLE_LABELS[pendingRole] : "your role"}
                  </span>.
                </p>
                <p className="text-slate-500 text-xs mt-1">Enter your 6-digit authenticator code.</p>
              </div>

              <form onSubmit={handleMFA} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
                    Verification Code
                  </label>
                  {/* OTP boxes — fixed width so they never overflow */}
                  <div className="grid grid-cols-6 gap-2">
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
                        className="w-full aspect-square text-center text-lg font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors caret-transparent select-none"
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs mt-2">
                    Demo: any 6 digits work — e.g. <span className="font-mono text-slate-500">1 2 3 4 5 6</span>
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !totpComplete}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Verifying…
                    </>
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
