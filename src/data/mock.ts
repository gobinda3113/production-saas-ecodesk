// ──────────────────────────────────────────────────────────────
// EchoDesk — Domain types & seed data (simulated backend layer)
// Mirrors the Prisma schema: Rules, Connections, Activity, Ledger…
// ──────────────────────────────────────────────────────────────

export type Platform = "instagram" | "facebook" | "tiktok";
export type MatchMode = "exact" | "contains" | "all";
export type RuleStatus = "active" | "inactive";

export interface KeywordRule {
  id: string;
  keyword: string;
  matchMode: MatchMode;
  platforms: Platform[];
  allPosts: boolean;
  postUrls: Partial<Record<Platform, string>>;
  reply: string;
  hits: number;
  trend: number[];
  status: RuleStatus;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  platform: Platform;
  message: string;
  keyword: string | null;
  status: "replied" | "no_match" | "error";
  processingMs: number;
  at: string;
}

export interface Connection {
  platform: Platform;
  connected: boolean;
  account: string | null;
  expiresInDays: number | null;
}

export type TxStatus = "completed" | "pending" | "failed";
export interface Transaction {
  id: string;
  date: string;
  plan: string;
  amount: number;
  gateway: "esewa" | "khalti";
  status: TxStatus;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    credits: 5,
    features: ["5 auto-reply credits", "All 3 platforms", "Full feature set", "Community support"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 100,
    credits: 90,
    features: ["90 auto-reply credits", "All 3 platforms", "Activity analytics", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 2000,
    credits: 2300,
    popular: true,
    features: ["2,300 credits", "API access", "Priority queue", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 5000,
    credits: 6000,
    features: ["6,000 credits", "API access", "Dedicated manager", "99.9% SLA"],
  },
];

export const PLATFORM_META: Record<
  Platform,
  { name: string; icon: string; chip: string; dot: string; brand: string }
> = {
  instagram: {
    name: "Instagram",
    icon: "photo_camera",
    chip: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300",
    dot: "#ec4899",
    brand: "#E1306C",
  },
  facebook: {
    name: "Facebook",
    icon: "thumb_up",
    chip: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "#2563eb",
    brand: "#1877F2",
  },
  tiktok: {
    name: "TikTok",
    icon: "music_note",
    chip: "bg-surface-high text-secondary",
    dot: "#5f5e5e",
    brand: "#010101",
  },
};

export const seedRules: KeywordRule[] = [
  {
    id: "r1",
    keyword: "kati ho",
    matchMode: "all",
    platforms: ["instagram", "facebook"],
    allPosts: true,
    postUrls: {},
    reply: "Namaste! 🙏 Yo product ko price NPR 1,499 ho. Free delivery inside valley! Order garna DM gardinus.",
    hits: 248,
    trend: [12, 18, 9, 24, 16, 31],
    status: "active",
    createdAt: "2026-01-04",
  },
  {
    id: "r2",
    keyword: "shipping",
    matchMode: "contains",
    platforms: ["instagram", "facebook", "tiktok"],
    allPosts: true,
    postUrls: {},
    reply: "We ship nationwide! 🚚 Inside valley: 1-2 days (free). Outside valley: 3-5 days (NPR 150).",
    hits: 132,
    trend: [6, 9, 14, 8, 11, 19],
    status: "active",
    createdAt: "2026-01-08",
  },
  {
    id: "r3",
    keyword: "available cha",
    matchMode: "all",
    platforms: ["instagram"],
    allPosts: false,
    postUrls: { instagram: "https://instagram.com/p/Cx91kLm" },
    reply: "Yes, in stock cha! 🟢 Kun size/color chahiyo? Hami aaja nai pathaaidinchau.",
    hits: 87,
    trend: [3, 7, 5, 12, 8, 9],
    status: "active",
    createdAt: "2026-01-12",
  },
  {
    id: "r4",
    keyword: "How much?",
    matchMode: "exact",
    platforms: ["facebook"],
    allPosts: true,
    postUrls: {},
    reply: "Thanks for asking! The price is NPR 2,499. Reply 'ORDER' to confirm. 🛍️",
    hits: 41,
    trend: [2, 4, 3, 6, 5, 7],
    status: "inactive",
    createdAt: "2026-01-15",
  },
];

export const seedActivity: ActivityItem[] = [
  { id: "a1", platform: "instagram", message: "Hello, yo bag ko kati ho?", keyword: "kati ho", status: "replied", processingMs: 312, at: "2 min ago" },
  { id: "a2", platform: "facebook", message: "Do you provide shipping to Pokhara?", keyword: "shipping", status: "replied", processingMs: 289, at: "11 min ago" },
  { id: "a3", platform: "tiktok", message: "nice video bro", keyword: null, status: "no_match", processingMs: 47, at: "26 min ago" },
  { id: "a4", platform: "instagram", message: "available cha yo wala?", keyword: "available cha", status: "replied", processingMs: 401, at: "48 min ago" },
  { id: "a5", platform: "facebook", message: "How much?", keyword: "How much?", status: "error", processingMs: 5012, at: "1 hr ago" },
  { id: "a6", platform: "instagram", message: "vau kati parcha yo?", keyword: "kati ho", status: "replied", processingMs: 355, at: "2 hr ago" },
  { id: "a7", platform: "tiktok", message: "price kati ho dai?", keyword: "kati ho", status: "replied", processingMs: 298, at: "3 hr ago" },
  { id: "a8", platform: "facebook", message: "thank you", keyword: null, status: "no_match", processingMs: 38, at: "4 hr ago" },
];

export const seedConnections: Connection[] = [
  { platform: "instagram", connected: true, account: "@thamel.threads", expiresInDays: 42 },
  { platform: "facebook", connected: true, account: "Thamel Threads Store", expiresInDays: 5 },
  { platform: "tiktok", connected: false, account: null, expiresInDays: null },
];

export const seedTransactions: Transaction[] = [
  { id: "TXN-9F2A4C", date: "2026-01-18", plan: "Growth", amount: 2000, gateway: "esewa", status: "completed" },
  { id: "TXN-7B1E9D", date: "2026-01-02", plan: "Starter", amount: 100, gateway: "khalti", status: "completed" },
  { id: "TXN-3C8A2F", date: "2025-12-15", plan: "Starter", amount: 100, gateway: "esewa", status: "completed" },
  { id: "TXN-1A0F5E", date: "2025-12-01", plan: "Starter", amount: 100, gateway: "khalti", status: "failed" },
];

// ── Admin seed data ──
export interface AdminClient {
  id: string;
  business: string;
  email: string;
  plan: string;
  credits: number;
  platforms: Platform[];
  lastActive: string;
  status: "active" | "disabled";
  trial: boolean;
}

export const seedClients: AdminClient[] = [
  { id: "c1", business: "Thamel Threads", email: "raju@thamelthreads.com", plan: "Growth", credits: 2287, platforms: ["instagram", "facebook"], lastActive: "2 min ago", status: "active", trial: false },
  { id: "c2", business: "Pokhara Pottery", email: "sita@pokharapottery.np", plan: "Starter", credits: 41, platforms: ["facebook"], lastActive: "1 hr ago", status: "active", trial: false },
  { id: "c3", business: "Lalitpur Leather", email: "bikash@llco.com", plan: "Free Trial", credits: 0, platforms: ["instagram"], lastActive: "3 hr ago", status: "active", trial: true },
  { id: "c4", business: "Everest Eats", email: "anjali@everesteats.np", plan: "Pro", credits: 5840, platforms: ["instagram", "facebook", "tiktok"], lastActive: "5 hr ago", status: "active", trial: false },
  { id: "c5", business: "Bhaktapur Beads", email: "hari@bbeads.com", plan: "Starter", credits: 12, platforms: ["instagram"], lastActive: "2 days ago", status: "disabled", trial: false },
];

export interface WebhookLog {
  id: string;
  client: string;
  platform: Platform;
  event: string;
  preview: string;
  keyword: string | null;
  status: "matched" | "no_match" | "error";
  ms: number;
  at: string;
}

export const seedWebhooks: WebhookLog[] = [
  { id: "w1", client: "Thamel Threads", platform: "instagram", event: "messages", preview: "Hello, yo bag ko kati ho? Delivery free cha?", keyword: "kati ho", status: "matched", ms: 312, at: "2026-01-19 14:02:11" },
  { id: "w2", client: "Pokhara Pottery", platform: "facebook", event: "feed", preview: "Do you provide shipping to Pokhara city area?", keyword: "shipping", status: "matched", ms: 289, at: "2026-01-19 13:51:44" },
  { id: "w3", client: "Everest Eats", platform: "tiktok", event: "comment", preview: "nice video bro keep it up 🔥", keyword: null, status: "no_match", ms: 47, at: "2026-01-19 13:40:09" },
  { id: "w4", client: "Thamel Threads", platform: "facebook", event: "messages", preview: "How much for the leather jacket size L?", keyword: null, status: "error", ms: 5012, at: "2026-01-19 13:22:30" },
];
