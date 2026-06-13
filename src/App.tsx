import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider, useStore, type Role } from "@/store";
import { Toaster } from "@/components/Toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Keywords = lazy(() => import("@/pages/Keywords"));
const Connections = lazy(() => import("@/pages/Connections"));
const Billing = lazy(() => import("@/pages/Billing"));
const Settings = lazy(() => import("@/pages/Settings"));
const AdminOverview = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.AdminOverview })));
const AdminClients = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.AdminClients })));
const AdminPayments = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.AdminPayments })));
const AdminWebhooks = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.AdminWebhooks })));
const AdminSystem = lazy(() => import("@/pages/Admin").then((m) => ({ default: m.AdminSystem })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Protected({ role, children }: { role: Role; children: React.ReactNode }) {
  const { role: current } = useStore();
  const location = useLocation();
  if (!current) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  }
  if (current !== role) {
    return <Navigate to={current === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Routing() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login admin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<HelpCenter />} />

        <Route path="/dashboard" element={<Protected role="client"><Dashboard /></Protected>} />
        <Route path="/keywords" element={<Protected role="client"><Keywords /></Protected>} />
        <Route path="/connections" element={<Protected role="client"><Connections /></Protected>} />
        <Route path="/billing" element={<Protected role="client"><Billing /></Protected>} />
        <Route path="/settings" element={<Protected role="client"><Settings /></Protected>} />

        <Route path="/admin" element={<Protected role="admin"><AdminOverview /></Protected>} />
        <Route path="/admin/clients" element={<Protected role="admin"><AdminClients /></Protected>} />
        <Route path="/admin/payments" element={<Protected role="admin"><AdminPayments /></Protected>} />
        <Route path="/admin/webhooks" element={<Protected role="admin"><AdminWebhooks /></Protected>} />
        <Route path="/admin/system" element={<Protected role="admin"><AdminSystem /></Protected>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routing />
              <Toaster />
            </ErrorBoundary>
          </BrowserRouter>
        </StoreProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
