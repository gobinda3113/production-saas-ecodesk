import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Icon, Card, Button } from "@/components/ui";

const ARTICLES = [
  { icon: "add", title: "Creating Keyword Rules", desc: "Step-by-step guide to setting up your first auto-reply." },
  { icon: "hub", title: "Connecting Platforms", desc: "How to link Instagram, Facebook, and TikTok accounts." },
  { icon: "match_word", title: "Match Modes Explained", desc: "Understanding Exact, Contains, and All Words modes." },
  { icon: "payments", title: "Billing & Credits", desc: "How credits work and how to purchase more." },
  { icon: "api", title: "API Integration", desc: "Using the EchoDesk API for custom integrations." },
  { icon: "support", title: "Contact Support", desc: "Reach our team for help with any issue." },
];

export default function HelpCenter() {
  return (
    <>
      <Helmet>
        <title>Help Center — EchoDesk</title>
        <meta name="description" content="EchoDesk help center — guides and support for your auto-reply setup." />
      </Helmet>
    <div className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <Icon name="graphic_eq" className="text-white text-[18px]" />
            </div>
            <span className="font-display text-xl text-primary font-extrabold">EchoDesk</span>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-bold">Help Center</h1>
        <p className="text-secondary text-sm mt-2">How can we help you?</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {ARTICLES.map((a) => (
            <Card key={a.title} hover className="p-5">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
                <Icon name={a.icon} className="text-[22px]" />
              </div>
              <h3 className="font-display font-semibold mt-4">{a.title}</h3>
              <p className="text-secondary text-sm mt-1">{a.desc}</p>
            </Card>
          ))}
        </div>
        <Card className="p-6 mt-8 text-center">
          <h2 className="font-display text-lg font-semibold">Still need help?</h2>
          <p className="text-secondary text-sm mt-1">Our support team is available Mon–Sat, 9 AM – 6 PM NPT.</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button icon="mail" onClick={() => window.location.href = "mailto:support@echodesk.com.np"}>Email Us</Button>
          </div>
        </Card>
      </main>
    </div>
    </>
  );
}
