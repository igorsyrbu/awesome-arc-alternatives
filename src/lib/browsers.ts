// The browser list lives in README.md. Vite bundles the file into the page at build
// time, so to add or change a browser, edit README.md only.
import readme from "../../README.md?raw"

export type Family = "Chromium" | "WebKit" | "Gecko" | "Mixed" | "Other"
export type OS = "Windows" | "macOS" | "Linux" | "iOS" | "Android"

export interface Browser {
  name: string
  site: string
  engine: string
  families: Family[] // a mixed-engine browser is listed under Mixed and each of its engines
  platforms: OS[] // one browser can run on several operating systems
  license: string
  repo: string
  open: boolean
  date: string
  stars: number | null
}

export const ENGINES: Family[] = ["Chromium", "WebKit", "Gecko", "Mixed", "Other"]
export const OSES: OS[] = ["macOS", "Windows", "Linux", "iOS", "Android"] // display order

const DAY = 86_400_000
export const NOW = Date.now()

function parseLink(cell: string) {
  const m = cell.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
  return m ? { text: m[1], url: m[2] } : { text: cell, url: "" }
}

function familiesOf(engine: string): Family[] {
  const chromium = /Chromium/.test(engine)
  const webkit = /WebKit/.test(engine)
  if (chromium && webkit) return ["Mixed", "Chromium", "WebKit"]
  if (chromium) return ["Chromium"]
  if (webkit) return ["WebKit"]
  if (/Gecko|Firefox/.test(engine)) return ["Gecko"]
  return ["Other"]
}

function platformsOf(cell: string, browser: string): OS[] {
  const found = new Set<OS>()
  for (const part of cell.split(",").map((p) => p.trim()).filter((p) => p && p !== "—")) {
    if (OSES.includes(part as OS)) found.add(part as OS)
    else console.warn(`${browser}: unknown platform "${part}" in README`)
  }
  return OSES.filter((os) => found.has(os))
}

export function parse(md: string): Browser[] {
  const block = md.split("<!-- list:start -->")[1].split("<!-- list:end -->")[0]
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((s) => s.trim())
  const [header, , ...lines] = block.split("\n").filter((l) => l.trim().startsWith("|"))
  // Find columns by header name, so a reordered or missing column fails loudly.
  const names = cells(header)
  const col = (name: string) => {
    const i = names.indexOf(name)
    if (i < 0) throw new Error(`README table has no "${name}" column`)
    return i
  }
  const [iName, iEngine, iPlatforms, iLicense, iSite, iRepo] = ["Browser", "Engine", "Platforms", "License", "Website", "GitHub"].map(col)

  return lines.map((line) => {
    const c = cells(line)
    const repo = parseLink(c[iRepo] || "").url
    return {
      name: c[iName],
      engine: c[iEngine],
      families: familiesOf(c[iEngine]),
      platforms: platformsOf(c[iPlatforms] || "", c[iName]),
      license: c[iLicense] || "Unknown",
      site: parseLink(c[iSite] || "").url,
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
