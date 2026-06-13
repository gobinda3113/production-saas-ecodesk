import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { Icon, Button, Card } from "@/components/ui";
import { cn } from "@/utils/cn";

export default function Login({ admin = false }: { admin?: boolean }) {
  const { login, toast } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(admin ? "admin" : "client");
      toast({ type: "success", title: "Welcome back!", desc: "Redirecting to your console…" });
      navigate(admin ? "/admin" : "/dashboard");
    }, 900);
  };

  const oauthLogin = (provider: string) => {
    setOauthLoading(provider);
    setTimeout(() => {
      setOauthLoading(null);
      login(admin ? "admin" : "client");
      toast({ type: "success", title: `Signed in with ${provider}`, desc: "Redirecting to your console…" });
      navigate(admin ? "/admin" : "/dashboard");
    }, 1200);
  };

  return (
    <>
      <Helmet>
        <title>{admin ? "Admin Login" : "Login"} — EchoDesk</title>
        <meta name="description" content={admin ? "Sign in to the EchoDesk admin console." : "Sign in to your EchoDesk merchant account to manage auto-replies."} />
      </Helmet>
    <div className="min-h-screen bg-[#F7F6F3] dark:bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center">
              <Icon name="graphic_eq" className="text-white text-[24px]" />
            </div>
            <span className="font-display text-2xl font-extrabold text-primary tracking-tight">EchoDesk</span>
          </Link>
          <p className="text-secondary opacity-70 mt-2 text-sm">Nepal's Premium Merchant Hub</p>
        </div>

        <Card className="p-8 transition-standard hover:border-primary-container/30">
          <h1 className="font-display text-xl font-semibold">
            {admin ? "Admin Console" : "Welcome back"}
          </h1>
          <p className="text-secondary text-sm mt-1">
            {admin ? "Sign in with your super admin credentials." : "Please enter your merchant credentials."}
          </p>

          {!admin && (
            <>
              <div className="mt-6 space-y-3">
                <button type="button" onClick={() => oauthLogin("Google")} disabled={!!oauthLoading} aria-label="Sign in with Google" className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[10px] border border-outline-variant/40 bg-surface-lowest hover:bg-surface-low transition-standard text-sm font-medium disabled:opacity-60">
                  {oauthLoading === "Google" ? <Icon name="progress_activity" className="animate-spin text-[18px]" /> : <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                  Continue with Google
                </button>
                <button type="button" onClick={() => oauthLogin("Facebook")} disabled={!!oauthLoading} aria-label="Sign in with Facebook" className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[10px] border border-outline-variant/40 bg-surface-lowest hover:bg-surface-low transition-standard text-sm font-medium disabled:opacity-60">
                  {oauthLoading === "Facebook" ? <Icon name="progress_activity" className="animate-spin text-[18px]" /> : <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                  Continue with Facebook
                </button>
              </div>
              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-outline-variant/30" />
                <span className="text-secondary text-xs font-medium">or continue with email</span>
                <span className="flex-1 h-px bg-outline-variant/30" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-[10px] border bg-surface-lowest text-on-background focus-gold transition-standard",
                  errors.email ? "border-error" : "border-black/10"
                )}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-error text-[13px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-primary text-[13px] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-[10px] border bg-surface-lowest text-on-background focus-gold transition-standard",
                    errors.password ? "border-error" : "border-black/10"
                  )}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-background"
                >
                  <Icon name={show ? "visibility_off" : "visibility"} className="text-[20px]" />
                </button>
              </div>
              {errors.password && <p className="text-error text-[13px] mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full py-3.5">
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6 space-y-2">
          {!admin ? (
            <>
              <p className="text-secondary text-sm">Don't have an account? Contact your admin.</p>
              <Link to="/admin/login" className="inline-flex items-center gap-1 text-primary font-semibold text-sm group">
                Admin login
                <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-standard" />
              </Link>
            </>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-1 text-primary font-semibold text-sm group">
              <Icon name="arrow_back" className="text-[16px] group-hover:-translate-x-1 transition-standard" />
              Merchant login
            </Link>
          )}
          <p className="text-secondary opacity-50 text-xs pt-2">
            &copy; {new Date().getFullYear()} EchoDesk · Secure 256-bit SSL encrypted connection.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
