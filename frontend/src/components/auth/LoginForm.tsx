import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

const DEMO_ACCOUNTS = [
  { label: "HOD (Admin)", email: "hod@hospital.in" },
  { label: "Officer (Admin)", email: "officer@hospital.in" },
  { label: "Lab Tech", email: "labtech@hospital.in" },
  { label: "Clinician", email: "clinician@hospital.in" },
  { label: "Nurse", email: "nurse@hospital.in" },
  { label: "Patient", email: "patient@hospital.in" },
];

export default function LoginForm() {
  const { login, verifyMfa, mfaPending } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Demo@1234");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyMfa(mfaCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "MFA verification failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo@1234");
    setError("");
  };

  // MFA step
  if (mfaPending) {
    return (
      <form onSubmit={handleMfa} className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">MFA Verification</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter the 6-digit code for <strong>{mfaPending.email}</strong>
          </p>
          <p className="mt-1 text-xs text-gray-400">(Demo: any 6 digits work, e.g. 123456)</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Input
          label="Verification Code"
          placeholder="000000"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          maxLength={6}
          pattern="\d{6}"
          autoFocus
        />

        <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    );
  }

  // Login step
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Input
        label="Email"
        type="email"
        placeholder="user@hospital.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" disabled={loading || !email}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      {/* Quick Demo Buttons */}
      <div className="pt-3 border-t">
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Demo Login</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acct) => (
            <button
              key={acct.email}
              type="button"
              onClick={() => quickLogin(acct.email)}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors text-left"
            >
              {acct.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
