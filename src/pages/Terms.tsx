import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Icon, Card } from "@/components/ui";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service — EchoDesk</title>
        <meta name="description" content="EchoDesk terms of service — conditions for using our auto-reply platform." />
      </Helmet>
    <div className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <Icon name="graphic_eq" className="text-white text-[18px]" />
            </div>
            <span className="font-display text-xl text-primary font-extrabold">EchoDesk</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
        <p className="text-secondary text-sm mt-2">Last updated: June 1, 2026</p>
        <Card className="p-6 mt-8 space-y-6 text-sm text-secondary leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">1. Acceptance of Terms</h2>
            <p className="mt-2">By using EchoDesk, you agree to these terms. If you do not agree, do not use the service.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">2. Service Description</h2>
            <p className="mt-2">EchoDesk provides automated reply services for Instagram, Facebook, and TikTok messages through keyword matching. Credits are consumed on successful matches only.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">3. User Responsibilities</h2>
            <p className="mt-2">You are responsible for the content of auto-replies. Automated replies must comply with platform terms of service. You must not use EchoDesk for spam or prohibited content.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">4. Payments & Refunds</h2>
            <p className="mt-2">All payments are processed via eSewa or Khalti. Credits are non-refundable unless required by applicable law.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">5. Limitation of Liability</h2>
            <p className="mt-2">EchoDesk is provided "as is" without warranty. We are not liable for damages arising from use of the service.</p>
          </section>
        </Card>
      </main>
    </div>
    </>
  );
}
