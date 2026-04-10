import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import fetch from "node-fetch"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.static(path.join(__dirname, "public")))

/* ---------------- CONFIG ---------------- */
const BROWSERLESS_TOKEN = "browserless_token" /* replace with api key from browserless.io */

/* ---------------- WEB MODE ---------------- */
app.get("/web", async (req, res) => {
  const url = req.query.url
  if (!url) return res.send("Missing URL")

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    })

    let html = await r.text()

    html = html.replace(/(href|src)=["'](.*?)["']/g, (m, attr, link) => {
      if (!link || link.startsWith("#")) return m

      try {
        const absolute = new URL(link, url).href
        return `${attr}="/web?url=${encodeURIComponent(absolute)}"`
      } catch {
        return m
      }
    })

    res.setHeader("Content-Type", "text/html")
    res.send(html)

  } catch (e) {
    res.send("Web mode error")
  }
})

/* ---------------- BROWSER MODE (Browserless stable) ---------------- */
app.get("/screenshot", async (req, res) => {
  const url = req.query.url
  const action = req.query.action ? JSON.parse(req.query.action) : null

  if (!url) return res.json({ error: "Missing URL" })

  try {
    const payload = {
      url,
      options: {
        type: "png",
        fullPage: true,
        timeout: 60000
      },
      gotoOptions: {
        waitUntil: "networkidle2",
        timeout: 60000
      }
    }

    /* optional interaction actions */
    if (action) {
      payload.actions = []

      if (action.type === "click") {
        payload.actions.push({
          type: "click",
          selector: "body",
          offset: { x: action.x, y: action.y }
        })
      }

      if (action.type === "type") {
        payload.actions.push({
          type: "type",
          text: action.text
        })
      }

      if (action.type === "scroll") {
        payload.actions.push({
          type: "scroll",
          y: action.y
        })
      }
    }

    const r = await fetch(
      `https://chrome.browserless.io/screenshot?token=${BROWSERLESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    )

    if (!r.ok) {
      const errText = await r.text()
      return res.json({
        error: "browserless_http_error",
        detail: errText
      })
    }

    const buffer = await r.arrayBuffer()

    return res.json({
      screenshot: Buffer.from(buffer).toString("base64")
    })

  } catch (e) {
    return res.json({
      error: "browserless_failed",
      detail: String(e)
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})
