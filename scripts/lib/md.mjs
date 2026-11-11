const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

export const markdownToHtml = (md) => {
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const out = []
  let inCode = false
  let inUl = false
  let inOl = false
  let inTable = false
  let para = []

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>")
      inUl = false
    }
    if (inOl) {
      out.push("</ol>")
      inOl = false
    }
  }

  const closePara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`)
      para = []
    }
  }

  const closeTable = () => {
    if (inTable) {
      out.push("</tbody></table></div>")
      inTable = false
    }
  }

  const inline = (text) => {
    let t = escape(text)
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>")
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    return t
  }

  for (const raw of lines) {
    const line = raw
    if (line.startsWith("```")) {
      closePara()
      closeLists()
      closeTable()
      if (inCode) {
        out.push("</code></pre>")
        inCode = false
      } else {
        out.push('<pre><code>')
        inCode = true
      }
      continue
    }
    if (inCode) {
      out.push(`${escape(line)}\n`)
      continue
    }
    if (!line.trim()) {
      closePara()
      closeLists()
      closeTable()
      continue
    }
    if (line.startsWith("|") && line.includes("|")) {
      closePara()
      closeLists()
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
      if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue
      if (!inTable) {
        out.push('<div class="table-wrap"><table><tbody>')
        inTable = true
        out.push(`<tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`)
      } else {
        out.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
      }
      continue
    }
    closeTable()
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      closePara()
      closeLists()
      const level = heading[1].length
      const id = heading[2]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      out.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`)
      continue
    }
    const ul = line.match(/^[-*]\s+(.*)$/)
    if (ul) {
      closePara()
      if (inOl) {
        out.push("</ol>")
        inOl = false
      }
      if (!inUl) {
        out.push("<ul>")
        inUl = true
      }
      out.push(`<li>${inline(ul[1])}</li>`)
      continue
    }
    const ol = line.match(/^\d+\.\s+(.*)$/)
    if (ol) {
      closePara()
      if (inUl) {
        out.push("</ul>")
        inUl = false
      }
      if (!inOl) {
        out.push("<ol>")
        inOl = true
      }
      out.push(`<li>${inline(ol[1])}</li>`)
      continue
    }
    closeLists()
    para.push(line.trim())
  }
  closePara()
  closeLists()
  closeTable()
  if (inCode) out.push("</code></pre>")
  return out.join("\n")
}
