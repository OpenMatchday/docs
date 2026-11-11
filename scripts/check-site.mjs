import { readFileSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const siteDir = join(root, "site")

const required = [
  "index.html",
  "operator.html",
  "developer.html",
  "contributor.html",
  "gates.html",
  "spikes.html",
  "privacy.html",
  "takedown.html",
  "styles.css",
  "sitemap.xml",
  "robots.txt",
  ".nojekyll",
]

for (const name of required) {
  if (!statSync(join(siteDir, name), { throwIfNoEntry: false })?.isFile()) {
    console.error(`missing docs site file: ${name}`)
    process.exit(1)
  }
}

for (const page of ["index.html", "operator.html", "developer.html", "contributor.html"]) {
  const html = readFileSync(join(siteDir, page), "utf8")
  if (!html.includes("Open Matchday") || !html.includes('id="main"') || !html.includes("skip-link")) {
    console.error(`${page} missing required chrome`)
    process.exit(1)
  }
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i.test(html)) {
    console.error(`${page} disables zoom`)
    process.exit(1)
  }
}

const operator = readFileSync(join(siteDir, "operator.html"), "utf8")
for (const needle of ["Matchday sequence", "Authority and event log", "Honest capability language"]) {
  if (!operator.includes(needle)) {
    console.error(`operator.html missing ${needle}`)
    process.exit(1)
  }
}

const index = readFileSync(join(siteDir, "index.html"), "utf8")
if (!index.includes("https://openmatchday.github.io/website/assets.html")) {
  console.error("index.html missing assets link")
  process.exit(1)
}

console.log("DOCS_CHECK_OK")
