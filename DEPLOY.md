# Deploy on GitHub Pages

The site is a small [Vite](https://vite.dev) + React app styled with [shadcn/ui](https://ui.shadcn.com). It reads the browser table from `README.md` when it is built. A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds it and publishes it to GitHub Pages on every push to `main`. Hosting and builds are free for public repositories.

## 1. Create the repository

1. Go to [github.com/new](https://github.com/new).
2. Name it `awesome-arc-alternatives`.
3. Choose **Public**.
4. Leave **Add a README**, **.gitignore** and **license** unticked. This folder already has them.
5. Click **Create repository**.

## 2. Push the code

From this folder:

```bash
git add .
git commit -m "Initial list of Arc alternatives"
git remote add origin https://github.com/igorsyrbu/awesome-arc-alternatives.git
git push -u origin main
```

`node_modules/` and `dist/` are in `.gitignore`, so they stay on your machine. GitHub installs and builds everything itself.

## 3. Turn on Pages

1. In the repo, open **Settings › Pages**.
2. Under **Build and deployment › Source**, choose **GitHub Actions**.
3. Open the **Actions** tab. If the first **Deploy** run failed because Pages was not on yet, open it and click **Re-run all jobs**.
4. When the run turns green (about a minute), the site is live at:

```
https://igorsyrbu.github.io/awesome-arc-alternatives/
```

## 4. Finish up

- **Fill in the repo's About panel.** Click the gear next to **About** on the repo page, tick **Use your GitHub Pages website**, and add the topics `awesome`, `awesome-list`, `arc-browser` and `browser`.

## Updating the list

Edit the table in `README.md` and commit, or merge a pull request. The workflow rebuilds and redeploys the site, usually within a minute or two. Nothing else needs updating.

## Work on the site locally

You need [Node.js](https://nodejs.org) 20.19 or newer and [pnpm](https://pnpm.io/installation). From this folder:

```bash
pnpm install
```

```bash
pnpm dev
```

Then open http://localhost:5173. The page reloads as you edit `src/` or `README.md`. Press `Ctrl+C` to stop.

To check the production build before pushing:

```bash
pnpm build && pnpm preview
```

### Where things are

| Path | What it is |
| --- | --- |
| `README.md` | The browser list. The only file most changes touch. |
| `src/App.tsx` | The page layout. |
| `src/lib/browsers.ts` | Reads the README table, fetches GitHub stars and last-updated dates. |
| `src/index.css` | Colors for light and dark mode. |
| `src/components/ui/` | shadcn/ui components. Add more with `pnpm dlx shadcn@latest add <name>`. |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages. |

## Custom domain (optional)

1. In **Settings › Pages › Custom domain**, enter your domain, for example `arcalternatives.com`, and click **Save**.
2. At your domain registrar, add DNS records:
   - For a subdomain like `www.example.com`: a `CNAME` record pointing to `igorsyrbu.github.io`.
   - For a root domain like `example.com`: `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
3. Once DNS has updated, tick **Enforce HTTPS**.

The build uses relative paths, so the same build works on a custom domain with no config change. See GitHub's guide on [managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for details.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Site shows a 404 | Check **Settings › Pages › Source** is **GitHub Actions**, not "Deploy from a branch". Then check the latest **Deploy** run in the **Actions** tab is green. |
| Site shows the README instead of the page | Same cause: Source is set to "Deploy from a branch". Switch it to **GitHub Actions**. |
| Deploy run fails at **pnpm install** | `pnpm-lock.yaml` is missing or out of date. Run `pnpm install` locally, commit `pnpm-lock.yaml`, and push. |
| Deploy run fails at **pnpm build** | Run `pnpm build` locally to see the same error, fix it, and push. The live site keeps the last good version meanwhile. |
| Deploy run fails at **deploy** with a permissions error | Pages wasn't turned on when it ran. Do step 3, then **Re-run all jobs**. |
| List looks empty or broken | Check that `<!-- list:start -->` and `<!-- list:end -->` are still in `README.md` and that each row has five `|`-separated cells. |
| Stars missing, every "Last updated" shows "no data" | GitHub allows 60 anonymous API requests per hour per visitor. The page saves results for 6 hours and works without stars and dates when the limit is hit. Try again later. |
| "Edit the list" opens the wrong file | That link points to the `main` branch. If your default branch is `master`, rename it to `main` in **Settings › Branches**. |
| Old version still showing | Hard-refresh with `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux). |
