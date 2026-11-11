import { mkdirSync, readFileSync, writeFileSync, readdirSync, copyFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { markdownToHtml } from "./lib/md.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const siteDir = join(root, "site")
const baseUrl = "https://openmatchday.github.io/docs/"

const nav = [
  { href: "index.html", label: "Home" },
  { href: "operator.html", label: "Operator" },
  { href: "developer.html", label: "Developer" },
  { href: "contributor.html", label: "Contributor" },
  { href: "gates.html", label: "Gates" },
  { href: "spikes.html", label: "Spikes" },
  { href: "privacy.html", label: "Privacy" },
  { href: "takedown.html", label: "Takedown" },
]

const shell = ({ title, description, file, body }) => {
  const canonical = file === "index.html" ? baseUrl : `${baseUrl}${file}`
  const navHtml = nav
    .map((item) => {
      const current = item.href === file ? ' aria-current="page"' : ""
      return `<a href="${item.href}"${current}>${item.label}</a>`
    })
    .join("\n        ")
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#0b100e">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Open Matchday Docs" translate="no">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="site-header-inner">
      <a class="brand-lockup" href="index.html" aria-label="Open Matchday docs home">
        <span class="brand-name" translate="no">Open Matchday Docs</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        ${navHtml}
      </nav>
    </div>
  </header>
  <main id="main" class="doc-main">
${body}
  </main>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p translate="no">Open Matchday Docs -- MIT</p>
      <p>
        <a href="https://openmatchday.github.io/website/">Product site</a>
        ·
        <a href="https://github.com/OpenMatchday/docs">Source</a>
      </p>
    </div>
  </footer>
</body>
</html>
`
}

mkdirSync(siteDir, { recursive: true })
mkdirSync(join(siteDir, "spikes"), { recursive: true })
mkdirSync(join(siteDir, "gates"), { recursive: true })
mkdirSync(join(siteDir, "privacy"), { recursive: true })

copyFileSync(join(root, "site-src", "styles.css"), join(siteDir, "styles.css"))
writeFileSync(join(siteDir, ".nojekyll"), "")

const pages = [
  {
    file: "operator.html",
    title: "Operator guide -- Open Matchday Docs",
    description: "Operator guide for local sports broadcast production with Open Matchday.",
    source: join(root, "guides", "operator.md"),
  },
  {
    file: "developer.html",
    title: "Developer guide -- Open Matchday Docs",
    description: "Developer guide for Open Matchday repositories, schemas, and verification.",
    source: join(root, "guides", "developer.md"),
  },
  {
    file: "contributor.html",
    title: "Contributor guide -- Open Matchday Docs",
    description: "How to contribute sports, themes, teams, website catalogs, and docs.",
    source: join(root, "guides", "contributor.md"),
  },
  {
    file: "privacy.html",
    title: "Minors and privacy -- Open Matchday Docs",
    description: "Minors consent and public registry privacy rules for Open Matchday.",
    source: join(root, "privacy", "minors-consent.md"),
  },
  {
    file: "takedown.html",
    title: "Takedown -- Open Matchday Docs",
    description: "Takedown process for public registry content. Git history erasure is not promised.",
    source: join(root, "privacy", "takedown.md"),
  },
]

for (const page of pages) {
  const md = readFileSync(page.source, "utf8")
  const body = `    <article class="doc-article">\n${markdownToHtml(md)}\n    </article>`
  writeFileSync(join(siteDir, page.file), shell({ ...page, body }))
}

const spikeFiles = readdirSync(join(root, "spikes")).filter((f) => f.endsWith(".md"))
const spikeLinks = []
for (const name of spikeFiles) {
  const md = readFileSync(join(root, "spikes", name), "utf8")
  const outName = name.replace(/\.md$/, ".html")
  const titleLine = md.split("\n").find((l) => l.startsWith("# "))?.slice(2) ?? name
  const body = `    <article class="doc-article">\n${markdownToHtml(md)}\n    </article>`
  writeFileSync(
    join(siteDir, "spikes", outName),
    shell({
      file: `spikes/${outName}`,
      title: `${titleLine} -- Open Matchday Docs`,
      description: `Spike record ${name}`,
      body,
    }),
  )
  spikeLinks.push(`- [${titleLine}](spikes/${outName})`)
}

const gateFiles = readdirSync(join(root, "gates")).filter((f) => f.endsWith(".md"))
const gateLinks = []
for (const name of gateFiles) {
  const md = readFileSync(join(root, "gates", name), "utf8")
  const outName = name.replace(/\.md$/, ".html")
  const titleLine = md.split("\n").find((l) => l.startsWith("# "))?.slice(2) ?? name
  const body = `    <article class="doc-article">\n${markdownToHtml(md)}\n    </article>`
  writeFileSync(
    join(siteDir, "gates", outName),
    shell({
      file: `gates/${outName}`,
      title: `${titleLine} -- Open Matchday Docs`,
      description: `Gate documentation ${name}`,
      body,
    }),
  )
  gateLinks.push(`- [${titleLine}](gates/${outName})`)
}

writeFileSync(
  join(siteDir, "spikes.html"),
  shell({
    file: "spikes.html",
    title: "Spikes -- Open Matchday Docs",
    description: "Decision spike records D1 through D8 for Open Matchday.",
    body: `    <article class="doc-article">\n${markdownToHtml(`# Spikes\n\nProvisional architecture decisions with citations.\n\n${spikeLinks.join("\n")}`)}\n    </article>`,
  }),
)

writeFileSync(
  join(siteDir, "gates.html"),
  shell({
    file: "gates.html",
    title: "Media gates -- Open Matchday Docs",
    description: "Media and output gate documentation. Numbers only from measurement records.",
    body: `    <article class="doc-article">\n${markdownToHtml(`# Media gates\n\nPass criteria are measured on the baseline rig. Do not publish numeric targets until recorded.\n\n${gateLinks.join("\n")}`)}\n    </article>`,
  }),
)

const indexMd = `# Open Matchday documentation

Long-form operator, developer, and contributor documentation for the Open Matchday organization. Product marketing lives on the [website](https://openmatchday.github.io/website/). This docs site publishes only implemented behavior and cited spike evidence.

## Start here

- [Operator guide](operator.html) -- roles, matchday sequence, OCR, authority, outputs, privacy
- [Developer guide](developer.html) -- repos, dependency rules, protocol, packages, security
- [Contributor guide](contributor.html) -- sports, themes, teams, website catalogs, PR hygiene

## Reference

- [Media gates](gates.html)
- [Architecture spikes D1-D8](spikes.html)
- [Minors and privacy](privacy.html)
- [Takedown](takedown.html)

## Product catalogs

Generated catalogs and default package assets (courts, formations, scoreboard schemas) are on the product site:

- [Capabilities](https://openmatchday.github.io/website/capabilities.html)
- [Sports](https://openmatchday.github.io/website/sports.html)
- [Assets](https://openmatchday.github.io/website/assets.html)
- [Registry browser](https://openmatchday.github.io/website/registry.html) (fictional schema samples only)

## Honesty rules

- No unmeasured latency, bitrate, or capability percentages.
- No fake maintainers, fake store listings, or fabricated screenshots.
- Shipped teams fixtures are fictional until real public registry contributions land through the moderated PR path.
`

writeFileSync(
  join(siteDir, "index.html"),
  shell({
    file: "index.html",
    title: "Open Matchday Docs",
    description: "Operator, developer, and contributor documentation for Open Matchday.",
    body: `    <article class="doc-article">\n${markdownToHtml(indexMd)}\n    </article>`,
  }),
)

const sitemapPaths = [
  "index.html",
  "operator.html",
  "developer.html",
  "contributor.html",
  "gates.html",
  "spikes.html",
  "privacy.html",
  "takedown.html",
  ...spikeFiles.map((n) => `spikes/${n.replace(/\.md$/, ".html")}`),
  ...gateFiles.map((n) => `gates/${n.replace(/\.md$/, ".html")}`),
]

writeFileSync(
  join(siteDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths
  .map((p) => {
    const loc = p === "index.html" ? baseUrl : `${baseUrl}${p}`
    return `  <url><loc>${loc}</loc></url>`
  })
  .join("\n")}
</urlset>
`,
)

writeFileSync(
  join(siteDir, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${baseUrl}sitemap.xml
`,
)

console.log(
  `DOCS_SITE_OK pages=${sitemapPaths.length} spikes=${spikeFiles.length} gates=${gateFiles.length}`,
)
