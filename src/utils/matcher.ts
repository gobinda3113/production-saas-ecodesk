// ──────────────────────────────────────────────────────────────
// EchoDesk 4-Layer Keyword Matching Engine
// Stops at the first matching layer. Mirrors the worker logic.
// ──────────────────────────────────────────────────────────────
import type { MatchMode } from "@/data/mock";

// Romanized Nepali phonetic normalization table
const PHONETIC: Record<string, string> = {
  paaila: "paila",
  payla: "paila",
  kati: "kati",
  kaati: "kati",
  parcha: "parcha",
  parchha: "parcha",
  parxa: "parcha",
  vau: "bhau",
  bhau: "bhau",
  ho: "ho",
  cha: "cha",
  xa: "cha",
};

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function phonetic(token: string): string {
  return PHONETIC[token] ?? token;
}

function phoneticPhrase(s: string): string {
  return normalize(s).split(" ").map(phonetic).join(" ");
}

// Levenshtein distance
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

export type Layer = "exact" | "phonetic" | "contains" | "fuzzy" | null;

export interface MatchResult {
  matched: boolean;
  layer: Layer;
}

export function matchKeyword(
  message: string,
  keyword: string,
  mode: MatchMode
): MatchResult {
  const msg = normalize(message);
  const kw = normalize(keyword);
  if (!kw) return { matched: false, layer: null };

  // Layer 1 — Exact (all modes)
  if (msg === kw) return { matched: true, layer: "exact" };
  if (mode === "exact") return { matched: false, layer: null };

  // 'contains' mode → Layer 3 only beyond exact
  if (mode === "contains") {
    if (msg.includes(kw)) return { matched: true, layer: "contains" };
    return { matched: false, layer: null };
  }

  // 'all' mode → layers 2 → 3 → 4
  // Layer 2 — Phonetic
  if (phoneticPhrase(msg).includes(phoneticPhrase(kw)))
    return { matched: true, layer: "phonetic" };

  // Layer 3 — Contains
  if (msg.includes(kw)) return { matched: true, layer: "contains" };

  // Layer 4 — Fuzzy (token-level, Levenshtein ≤ 2)
  const kwTokens = kw.split(" ");
  const msgTokens = msg.split(" ");
  const allFuzzy = kwTokens.every((kt) =>
    msgTokens.some((mt) => lev(kt, mt) <= 2)
  );
  if (allFuzzy) return { matched: true, layer: "fuzzy" };

  return { matched: false, layer: null };
}
