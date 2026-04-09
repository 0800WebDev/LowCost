import express from "express"
import fetch from "node-fetch"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, "public")))

const API_KEY = "YOUR_SCRAPFLY_KEY"

app.get("/web", async (req, res) => {
  const url = req.query.url
  if (!url) return res.send("Missing URL")

  try {
    const r = await fetch(`https://api.scrapfly.io/scrape?url=${encodeURIComponent(url)}&key=${API_KEY}`)
    let html = await r.text()

    html = html.replace(/(href|src)=["'](.*?)["']/g, (m, attr, link) => {
      if (link.startsWith("http")) {
        return `${attr}="/web?url=${encodeURIComponent(link)}"`
      }
      return m
    })

    res.send(html)
  } catch (e) {
    res.send("Error fetching page")
  }
})

app.get("/screenshot", async (req, res) => {
  const url = req.query.url
  if (!url) return res.json({ error: "Missing URL" })

  try {
    const r = await fetch(
      `https://api.scrapfly.io/scrape?url=${encodeURIComponent(url)}&render_js=true&screenshot=true&key=${API_KEY}`
    )
    const data = await r.json()

    res.json({
      screenshot: data.result.screenshot
    })
  } catch (e) {
    res.json({ error: "Failed to fetch screenshot" })
  }
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})
