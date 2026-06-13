import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Icon, Card } from "@/components/ui";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — EchoDesk</title>
        <meta name="description" content="EchoDesk privacy policy — how we collect, use, and protect your data." />
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
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="text-secondary text-sm mt-2">Last updated: June 1, 2026</p>
        <Card className="p-6 mt-8 space-y-6 text-sm text-secondary leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">1. Information We Collect</h2>
            <p className="mt-2">We collect information you provide when creating an account, including your business name, email address, and connected social media accounts. We also collect message data processed through our keyword matching service.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">2. How We Use Your Information</h2>
            <p className="mt-2">Your information is used solely to operate the EchoDesk service: matching keywords, sending auto-replies, and providing analytics. We never sell your data to third parties.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">3. Data Security</h2>
            <p className="mt-2">All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use official Meta and TikTok APIs only — no bots or scraping.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">4. Data Retention</h2>
            <p className="mt-2">Message data is retained for 90 days. Account data is retained until you request deletion. You can request deletion at any time from your Settings page.</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-on-background">5. Contact</h2>
            <p className="mt-2">For privacy inquiries, email privacy@echodesk.com.np.</p>
          </section>
        </Card>
      </main>
    </div>
    </>
  );
}
