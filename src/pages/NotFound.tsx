import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Icon, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-primary-container/10 flex items-center justify-center mx-auto">
          <Icon name="search_off" className="text-[40px] text-primary-container" />
        </div>
        <h1 className="font-display text-5xl font-extrabold text-primary mt-6">404</h1>
        <p className="font-display text-xl font-semibold mt-2">Page not found</p>
        <p className="text-secondary text-sm mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button icon="arrow_back">Back to Home</Button>
        </Link>
      </div>
    </div>
    </>
  );
}
