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
  const action = req.query.action ? JSON.parse(req.query.action) : null

  if (!url) return res.json({ error: "Missing URL" })

  let actions = []

  if (action) {
    if (action.type === "click") {
      actions.push({
        action: "click",
        x: action.x,
        y: action.y
      })
    }

    if (action.type === "type") {
      actions.push({
        action: "type",
        text: action.text
      })
    }

    if (action.type === "scroll") {
      actions.push({
        action: "scroll",
        x: 0,
        y: action.y
      })
    }
  }

  try {
    const r = await fetch("https://api.scrapfly.io/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        key: API_KEY,
        url,
        render_js: true,
        screenshot: true,
        actions
      })
    })

    const data = await r.json()

    res.json({
      screenshot: data.result.screenshot
    })
  } catch (e) {
    res.json({ error: "Failed" })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})
