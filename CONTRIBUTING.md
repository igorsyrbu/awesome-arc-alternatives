# Contributing

The whole list is one table in [README.md](README.md), between the `<!-- list:start -->` and `<!-- list:end -->` markers. The web page is built from that table, so there is nothing else to update.

## Add a browser

Add one row, in alphabetical order:

```md
| Name | Engine | Platforms | License | [example.com](https://example.com) | [owner/repo](https://github.com/owner/repo) |
```

- **Browser:** the plain name, no link.
- **Engine:** `Chromium`, `WebKit`, `Firefox (Gecko)`, or a mix. Add detail in brackets, like `Chromium (Electron)`. Write `(likely)` or `(unconfirmed)` when the project does not say.
- **Platforms:** where the browser has a public build, comma-separated: `Windows`, `macOS`, `Linux`, `iOS` or `Android`, in any order. A browser can support more than one. List only builds a person can install, so leave out source-only or unmaintained ports. iOS covers iPhone and iPad. Write `—` if there is no public build yet.
- **License:** plain text, like `MIT` or `GPL-3.0`. Use `Closed` for closed source, or `Unknown` if you can't tell.
- **Website:** link to the official website. Write `—` if there is none.
- **GitHub:** link to the GitHub repo, written as `owner/repo`. Write `—` if there is no public repo. Only browsers with a GitHub link count as open source on the page.

Write `—` in any cell with no data. Keep all six `|` separators in every row.

## What belongs here

- The browser is Arc-like: vertical tabs or a sidebar, spaces or workspaces, a command bar, or a similar calm, tab-centric design.
- It is publicly available or has a public beta, waitlist or TestFlight.
- No affiliate or referral links.

Submitting your own project is welcome. Please disclose that in the pull request.

## Keep it fresh

Fixing licenses and dead links are contributions too. Dates and stars are not in the table: for open source projects on GitHub, the page reads the latest push date and star count live. Browsers without a public GitHub repo show no date.

One browser per pull request, please.
