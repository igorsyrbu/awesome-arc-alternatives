// The browser list lives in README.md. Vite bundles the file into the page at build
// time, so to add or change a browser, edit README.md only.
import readme from "../../README.md?raw"

export type Family = "Chromium" | "WebKit" | "Gecko" | "Mixed" | "Other"

export interface Browser {
  name: string
  site: string
  engine: string
  family: Family
  license: string
  repo: string
  open: boolean
  date: string
  stars: number | null
}

export const ENGINES: Family[] = ["Chromium", "WebKit", "Gecko", "Mixed", "Other"]

const DAY = 86_400_000
export const NOW = Date.now()

function parseLink(cell: string) {
  const m = cell.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
  return m ? { text: m[1], url: m[2] } : { text: cell, url: "" }
}

function familyOf(engine: string): Family {
  if (/Chromium/.test(engine) && /WebKit/.test(engine)) return "Mixed"
  if (/Chromium/.test(engine)) return "Chromium"
  if (/WebKit/.test(engine)) return "WebKit"
  if (/Gecko|Firefox/.test(engine)) return "Gecko"
  return "Other"
}

export function parse(md: string): Browser[] {
  const block = md.split("<!-- list:start -->")[1].split("<!-- list:end -->")[0]
  return block
    .split("\n")
    .filter((l) => l.trim().startsWith("|"))
    .slice(2) // header + separator
    .map((line) => {
      const c = line.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim())
      // Columns: Browser | Engine | License | Website | GitHub
      const repo = parseLink(c[4] || "").url
      return {
        name: c[0],
        engine: c[1],
        family: familyOf(c[1]),
        license: c[2] || "Unknown",
        site: parseLink(c[3] || "").url,
        repo,
        open: /^https:\/\/github\.com\//.test(repo), // open source = has a GitHub repo link
        date: "", // filled in live from GitHub
        stars: null, // filled in live from GitHub
      }
    })
}

export const BROWSERS = parse(readme)

export function daysSince(date: string) {
  return Math.floor((NOW - new Date(date + "T00:00").getTime()) / DAY)
}

export function ago(date: string) {
  const d = daysSince(date)
  if (d < 1) return "today"
  if (d < 2) return "yesterday"
  if (d < 14) return `${d} days ago`
  if (d < 60) return `${Math.round(d / 7)} weeks ago`
  if (d < 365) return `${Math.round(d / 30)} months ago`
  const y = Math.round(d / 365)
  return y === 1 ? "1 year ago" : `${y} years ago`
}

export function short(n: number) {
  return n < 1000 ? String(n) : (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "") + "k"
}

export function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - NOW) / DAY)
}

// For GitHub repos, read stars and the latest push date ("Last updated").
// Browsers without a public GitHub repo have no date. Cached for 6 hours to stay
// well under GitHub's anonymous rate limit of 60 requests per hour.
type Cache = { t: number; d: Record<string, { p: string; s: number }> }
const KEY = "gh-repos-v2"

export async function freshen(rows: Browser[]): Promise<Browser[]> {
  let cache: Cache = { t: NOW, d: {} }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as Cache | null
    if (saved && NOW - saved.t < 6 * 3600 * 1000) cache = saved
  } catch {
    // no storage, fetch fresh
  }

  const next = await Promise.all(
    rows.map(async (r) => {
      const slug = r.repo.match(/^https:\/\/github\.com\/([^/]+\/[^/#?]+)/)?.[1]
      if (!slug) return r
      let v = cache.d[slug]
      if (!v) {
        try {
          const res = await fetch(`https://api.github.com/repos/${slug}`)
          if (!res.ok) return r
          const j = await res.json()
          v = { p: (j.pushed_at || "").slice(0, 10), s: j.stargazers_count }
          cache.d[slug] = v // failures are not cached, so they retry next visit
        } catch {
          return r
        }
      }
      return {
        ...r,
        date: v.p || r.date,
        stars: typeof v.s === "number" ? v.s : r.stars,
      }
    }),
  )

  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
  return next
}

// GitHub links. The deploy workflow passes the repo name in at build time, so this
// works on username.github.io/repo and on a custom domain.
function repoUrl() {
  if (__REPO__) return `https://github.com/${__REPO__}`
  const host = location.hostname
  if (host.endsWith(".github.io")) {
    return `https://github.com/${host.split(".")[0]}/${location.pathname.split("/")[1] || host}`
  }
  return "https://github.com/igorsyrbu/awesome-arc-alternatives"
}
export const REPO_URL = repoUrl()
