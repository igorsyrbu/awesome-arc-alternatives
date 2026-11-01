import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Moon, Search, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  BROWSERS,
  ENGINES,
  NOW,
  OSES,
  REPO_URL,
  ago,
  daysSince,
  daysUntil,
  freshen,
  short,
  type Browser,
  type Family,
  type OS,
} from "@/lib/browsers"
import logo from "@/assets/logo.png"
import { cn } from "@/lib/utils"

type SortKey = "name" | "engine" | "license" | "stars" | "date"
const COLUMNS: { key: SortKey; label: string; first: "asc" | "desc" }[] = [
  { key: "name", label: "Browser", first: "asc" },
  { key: "engine", label: "Engine", first: "asc" },
  { key: "license", label: "License", first: "asc" },
  { key: "stars", label: "Stars", first: "desc" },
  { key: "date", label: "Last updated", first: "desc" },
]

// Desktop: six columns, two lines in the first one (name + platforms). Phones: one
// column with small labels.
const ROW =
  "grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 px-1 py-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,0.8fr)_76px_minmax(0,0.9fr)_168px] md:grid-rows-[auto_auto] md:gap-x-4 md:gap-y-0 md:px-2 md:py-3.5"

const ARC_END = new Date(2026, 11, 22)
const TIMELINE = [
  { date: "2026-10-22", label: "Oct 22", text: "No new Arc accounts" },
  { date: "2026-11-23", label: "Nov 23", text: "Arc Search AI features off, no sync" },
  { date: "2026-12-22", label: "Dec 22", text: "Arc stops working. Accounts deleted within 30 days", final: true },
]

export default function App() {
  const [rows, setRows] = useState<Browser[]>(BROWSERS)
  const [loaded, setLoaded] = useState(false) // GitHub stars and dates are in
  useEffect(() => {
    freshen(BROWSERS).then((next) => {
      setRows(next)
      setLoaded(true)
    })
  }, [])

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-8">
      <Header />
      <Hero rows={rows} loaded={loaded} />
      <BrowserList rows={rows} loaded={loaded} />
      <footer className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t pt-8 pb-12 text-[13px] text-muted-foreground">
        <span>
          Missing a browser or something out of date?{" "}
          <a className="text-foreground underline underline-offset-2" href={`${REPO_URL}/edit/main/README.md`}>
            Edit the list
          </a>
          .
        </span>
        <span>
          Not affiliated with The Browser Company ·{" "}
          <a className="text-foreground underline underline-offset-2" href={`${REPO_URL}/blob/main/LICENSE`}>
            CC0
          </a>
        </span>
      </footer>
    </div>
  )
}

function Header() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  function toggleTheme() {
    const next = !dark
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      // ignore
    }
    setDark(next)
  }

  return (
    <header className="flex items-center justify-between gap-3 py-[18px]">
      <a href="./" className="flex min-w-0 items-center gap-2.5 leading-tight font-medium">
        <Logo />
        Awesome Arc Alternatives
      </a>
      <nav className="flex items-center gap-2">
        <Button variant="outline" asChild className="text-label max-sm:size-9 max-sm:px-0">
          <a href={REPO_URL} aria-label="GitHub">
            <GitHubIcon />
            <span className="max-sm:hidden">GitHub</span>
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-label"
          onClick={toggleTheme}
          aria-label="Switch light or dark theme"
          title="Switch theme"
        >
          {dark ? <Moon /> : <Sun />}
        </Button>
      </nav>
    </header>
  )
}

function Hero({ rows, loaded }: { rows: Browser[]; loaded: boolean }) {
  const left = daysUntil(ARC_END)
  const stats = [
    { label: "browsers", value: rows.length },
    { label: "updated this month", value: loaded ? rows.filter((r) => r.date && daysSince(r.date) <= 31).length : "–" },
    { label: "open source", value: rows.filter((r) => r.open).length },
  ]

  return (
    <div className="pt-9 pb-7 md:pt-14 md:pb-10">
      <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pr-3 pl-2.5 text-[13px] text-muted-foreground">
        <span className="size-2 rounded-full bg-brand animate-pulse-ring" />
        {left > 0 ? (
          <span>
            Arc stops working in{" "}
            <b className="font-medium text-foreground tabular-nums">
              {left} {left === 1 ? "day" : "days"}
            </b>{" "}
            · Dec 22, 2026
          </span>
        ) : (
          <span>
            Arc stopped working on <b className="font-medium text-foreground">Dec 22, 2026</b>
          </span>
        )}
      </p>
      <h1 className="text-[clamp(40px,7vw,68px)] leading-[1.02] font-semibold tracking-[-0.04em]">
        Life after <span className="text-gradient">Arc</span>.
      </h1>
      <p className="mt-[18px] max-w-[56ch] text-lg text-pretty text-muted-foreground">
        The Browser Company is sunsetting our beloved Arc.
        <br />
        Here is a curated, community-maintained list of browsers with vertical tabs, spaces, and command bars, so you
        can pick where to go next.
      </p>

      <dl className="mt-9 flex flex-wrap gap-x-9 gap-y-2">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="text-[13px] text-muted-foreground">{s.label}</dt>
            <dd className="font-mono text-[28px] leading-tight font-medium tracking-tight tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-11 ml-[3px] grid border-l md:ml-0 md:grid-cols-3 md:border-t md:border-l-0">
        {TIMELINE.map((t) => {
          const past = new Date(t.date + "T00:00").getTime() <= NOW
          return (
            <li key={t.date} className="relative pb-4 pl-[18px] text-sm text-muted-foreground md:pt-3.5 md:pr-4 md:pb-0 md:pl-0">
              <span
                className={cn(
                  "absolute top-1.5 -left-1 size-[7px] rounded-full bg-faint md:-top-1 md:left-0",
                  past && "bg-foreground",
                  t.final && "bg-brand",
                )}
              />
              <time className="mb-0.5 block font-mono text-[13px] font-medium text-foreground">{t.label}</time>
              {t.text}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function BrowserList({ rows, loaded }: { rows: Browser[]; loaded: boolean }) {
  const [q, setQ] = useState("")
  const [engine, setEngine] = useState("all")
  const [platform, setPlatform] = useState("all")
  const [openOnly, setOpenOnly] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" })

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const d = sort.dir === "asc" ? 1 : -1
    return rows
      .filter(
        (r) =>
          (engine === "all" || r.families.includes(engine as Family)) &&
          (platform === "all" || r.platforms.includes(platform as OS)) &&
          (!openOnly || r.open) &&
          (!needle || `${r.name} ${r.engine} ${r.license} ${r.platforms.join(" ")}`.toLowerCase().includes(needle)),
      )
      .sort((a, b) => {
        const x = a[sort.key]
        const y = b[sort.key]
        const noX = x == null || x === ""
        const noY = y == null || y === ""
        if (noX !== noY) return noX ? 1 : -1 // empty values always go last
        if (!noX && x !== y) {
          return (typeof x === "number" ? x - (y as number) : String(x).localeCompare(String(y))) * d
        }
        return a.name.localeCompare(b.name)
      })
  }, [rows, q, engine, platform, openOnly, sort])

  function sortBy(c: (typeof COLUMNS)[number]) {
    setSort((s) => (s.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: c.first }))
  }

  const engineCount = (f: string) => rows.filter((r) => r.families.includes(f as Family)).length
  const platformCount = (os: string) => rows.filter((r) => r.platforms.includes(os as OS)).length

  return (
    <section className="py-10">
      <h2 className="mb-1.5 text-[22px] font-semibold tracking-tight">Browsers</h2>
      <p className="mb-5 max-w-[78ch] text-sm text-muted-foreground">
        Last updated is the latest GitHub push; “no data” means there is no public repo. Platforms show where a
        browser has a public build.
      </p>

      <div className="mb-4 flex flex-col gap-2.5" role="group" aria-label="Filters">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-0 flex-[1_1_220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search browsers"
              aria-label="Search browsers, engines, platforms"
              className="bg-card pl-9 placeholder:text-muted-foreground"
            />
          </div>

          <Toggle
            variant="outline"
            pressed={openOnly}
            onPressedChange={setOpenOnly}
            className="bg-card px-3 text-label data-[state=on]:text-foreground"
          >
            Open source
          </Toggle>
        </div>

        <FilterGroup
          label="Engine"
          value={engine}
          onChange={setEngine}
          options={[
            { value: "all", label: "All", count: rows.length },
            ...ENGINES.filter((f) => engineCount(f) > 0).map((f) => ({ value: f, label: f, count: engineCount(f) })),
          ]}
        />

        <FilterGroup
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "all", label: "All", count: rows.length },
            ...OSES.filter((os) => platformCount(os) > 0).map((os) => ({
              value: os,
              label: os,
              count: platformCount(os),
            })),
          ]}
        />
      </div>

      <div className="border-t" aria-live="polite">
        <div
          role="group"
          aria-label="Sort by column"
          className={cn(
            ROW,
            "scrollbar-none sticky top-0 z-10 flex gap-[18px] overflow-x-auto border-b bg-background/88 py-0 backdrop-blur-md md:grid md:items-center md:py-0",
          )}
        >
          <span className="self-center text-xs text-faint md:hidden">Sort</span>
          {COLUMNS.map((c) => {
            const on = sort.key === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => sortBy(c)}
                aria-label={`Sort by ${c.label}${on ? `, sorted ${sort.dir === "asc" ? "ascending" : "descending"}` : ""}`}
                className={cn(
                  "inline-flex flex-none cursor-pointer items-center gap-1 rounded py-3 whitespace-nowrap text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  on && "text-foreground",
                )}
              >
                {c.label}
                <span className="w-[1em]">
                  {on && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </span>
              </button>
            )
          })}
          <div className="hidden md:block" />
        </div>

        {shown.map((r) => (
          <Row key={r.name} r={r} loaded={loaded} />
        ))}
        {!shown.length && <div className="px-2 py-10 text-center text-muted-foreground">No browsers match these filters.</div>}
      </div>
    </section>
  )
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; count: number }[]
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="w-14 flex-none text-[10px] font-medium tracking-[0.07em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="scrollbar-none min-w-0 flex-1 overflow-x-auto">
        <ToggleGroup
          type="single"
          spacing={0.5}
          value={value}
          onValueChange={(v) => v && onChange(v)}
          aria-label={label}
          className="w-max rounded-[10px] border border-input bg-card p-[3px]"
        >
          {options.map((o) => (
            <ToggleGroupItem
              key={o.value}
              value={o.value}
              className="h-7 gap-1.5 rounded-[7px] px-2.5 font-normal text-label hover:bg-muted hover:text-foreground data-[state=on]:bg-accent data-[state=on]:font-medium data-[state=on]:text-foreground"
            >
              {o.label}
              <span className="font-mono text-xs text-muted-foreground">{o.count}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}

function Row({ r, loaded }: { r: Browser; loaded: boolean }) {
  const checking = !loaded && /github\.com/.test(r.repo)
  return (
    <div className={cn(ROW, "border-b hover:bg-muted md:items-center")}>
      <div className="col-start-1 row-start-1 min-w-0">
        <span className="font-semibold tracking-[-0.01em]">{r.name}</span>
      </div>

      <div
        className="col-span-full row-start-2 min-w-0 text-xs text-muted-foreground md:col-span-1 md:col-start-1 md:row-start-2 md:mt-0.5"
      >
        {r.platforms.length ? (
          <ul className="flex flex-wrap gap-x-1.5">
            {r.platforms.map((os) => (
              <li key={os} className="whitespace-nowrap not-last:after:ml-1.5 not-last:after:content-['·']">
                {os}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-faint">—</span>
        )}
      </div>

      {/* Phones: engine, license and stars share one line under the platforms. */}
      <div className="col-span-full row-start-3 flex flex-wrap gap-x-3 gap-y-0.5 md:contents">
        <div className="text-sm text-muted-foreground md:col-start-2 md:row-span-2 md:row-start-1">{r.engine}</div>

        <div className="font-mono text-[13px] text-muted-foreground md:col-start-3 md:row-span-2 md:row-start-1">
          {r.license}
        </div>

        <div
          className={cn(
            "font-mono text-[13px] whitespace-nowrap text-muted-foreground tabular-nums md:col-start-4 md:row-span-2 md:row-start-1",
            r.stars == null && "hidden md:block",
          )}
          title={r.stars != null ? `${r.stars.toLocaleString()} GitHub stars` : undefined}
        >
          {r.stars == null ? "–" : `★ ${short(r.stars)}`}
        </div>
      </div>

      <div
        className="col-start-2 row-start-1 text-right text-[13px] text-muted-foreground md:col-start-5 md:row-span-2 md:row-start-1 md:text-left md:text-sm md:text-foreground"
        title={r.date || undefined}
      >
        {checking ? (
          <span className="text-muted-foreground">Checking…</span>
        ) : r.date ? (
          ago(r.date)
        ) : (
          <span className="text-faint">no data</span>
        )}
      </div>

      <div className="col-span-full row-start-4 mt-1 flex gap-1.5 md:col-span-1 md:col-start-6 md:row-span-2 md:row-start-1 md:mt-0 md:justify-end">
        {r.site && <LinkButton href={r.site}>Website ↗</LinkButton>}
        {r.repo && <LinkButton href={r.repo}>{/github\.com/.test(r.repo) ? "GitHub ↗" : "Code ↗"}</LinkButton>}
      </div>
    </div>
  )
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="outline" size="sm" asChild className="bg-card px-3 font-normal text-label hover:text-foreground">
      <a href={href} target="_blank" rel="noopener">
        {children}
      </a>
    </Button>
  )
}

function Logo() {
  return <img src={logo} alt="" className="size-8" />
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
