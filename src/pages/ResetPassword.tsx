import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { Icon, Button, Card } from "@/components/ui";

export default function ResetPassword() {
  const { toast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ type: "error", title: "Password too short", desc: "Must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      toast({ type: "error", title: "Passwords don't match", desc: "Please confirm your password." });
      return;
    }
    if (!token) {
      toast({ type: "error", title: "Invalid reset link", desc: "This link is invalid or expired." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      toast({ type: "error", title: "Reset failed", desc: "This link may have expired. Request a new one." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-[#F7F6F3] dark:bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center">
                <Icon name="graphic_eq" className="text-white text-[24px]" />
              </div>
              <span className="font-display text-2xl font-extrabold text-primary tracking-tight">EchoDesk</span>
            </Link>
          </div>

          <Card className="p-8 transition-standard">
            {done ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                  <Icon name="check_circle" className="text-[32px] text-green-600" />
                </div>
                <h1 className="font-display text-xl font-semibold mt-4">Password reset!</h1>
                <p className="text-secondary text-sm mt-2">Redirecting you to login…</p>
              </div>
            ) : (
              <>
                <h1 className="font-display text-xl font-semibold">Set new password</h1>
                <p className="text-secondary text-sm mt-1">Choose a strong password for your account.</p>
                <form onSubmit={submit} className="space-y-4 mt-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-[10px] border border-black/10 bg-surface-lowest text-on-background focus-gold transition-standard"
                        required
                      />
                      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-background">
                        <Icon name={show ? "visibility_off" : "visibility"} className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium mb-1.5">Confirm Password</label>
                    <input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] border border-black/10 bg-surface-lowest text-on-background focus-gold transition-standard"
                      required
                    />
                  </div>
                  <Button type="submit" loading={loading} className="w-full py-3.5">
                    {loading ? "Resetting…" : "Reset Password"}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
