import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { Icon, Button, Card } from "@/components/ui";

export default function ForgotPassword() {
  const { toast } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ type: "error", title: "Invalid email", desc: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      toast({ type: "error", title: "Something went wrong", desc: "Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — EchoDesk</title>
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
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center mx-auto">
                  <Icon name="mail" className="text-[32px] text-primary-container" />
                </div>
                <h1 className="font-display text-xl font-semibold mt-4">Check your email</h1>
                <p className="text-secondary text-sm mt-2">
                  If an account exists for <span className="font-semibold text-on-background">{email}</span>, we've sent a password reset link.
                </p>
                <Link to="/login" className="inline-flex items-center gap-1 text-primary font-semibold text-sm mt-6 group">
                  <Icon name="arrow_back" className="text-[16px] group-hover:-translate-x-1 transition-standard" />
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="font-display text-xl font-semibold">Forgot password?</h1>
                <p className="text-secondary text-sm mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={submit} className="space-y-4 mt-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-[10px] border border-black/10 bg-surface-lowest text-on-background focus-gold transition-standard"
                      required
                    />
                  </div>
                  <Button type="submit" loading={loading} className="w-full py-3.5">
                    {loading ? "Sending…" : "Send Reset Link"}
                  </Button>
                </form>
                <div className="text-center mt-4">
                  <Link to="/login" className="text-primary font-semibold text-sm hover:underline">
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
