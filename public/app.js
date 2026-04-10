const frame = document.getElementById("frame")
const screen = document.getElementById("screen")

let currentUrl = ""
let lastAction = null
let running = false

function go() {
  let url = document.getElementById("url").value
  const mode = document.getElementById("mode").value

  if (!url.startsWith("http")) url = "https://" + url

  running = false
  screen.style.display = "none"
  frame.style.display = "block"

  frame.src = ""
  screen.src = ""

  if (mode === "web") {
    frame.style.display = "block"
    frame.src = "/web?url=" + encodeURIComponent(url)
  }

  else if (mode === "browser") {
    frame.style.display = "none"
    screen.style.display = "block"
    startBrowser(url)
  }

  else if (mode === "iframe") {
    frame.style.display = "block"
    frame.src = url
  }

  else if (mode === "embed") {
    frame.style.display = "block"
    frame.src = url
  }

  else if (mode === "object") {
    frame.style.display = "block"
    frame.src = url
  }
}

function startBrowser(url) {
  currentUrl = url
  running = true
  loop()
}

async function loop() {
  if (!running) return

  try {
    const actionParam = lastAction
      ? "&action=" + encodeURIComponent(JSON.stringify(lastAction))
      : ""

    lastAction = null

    const res = await fetch("/screenshot?url=" + encodeURIComponent(currentUrl) + actionParam)
    const data = await res.json()

    if (data.error) {
      console.log("Browser error:", data.error, data.detail)
    }

    if (data.screenshot) {
      screen.src = "data:image/png;base64," + data.screenshot
    }

  } catch (e) {
    console.log("Loop error", e)
  }

  setTimeout(loop, 300)
}

/* ---------------- INPUT HANDLING ---------------- */

screen.addEventListener("click", (e) => {
  const rect = screen.getBoundingClientRect()

  lastAction = {
    type: "click",
    x: Math.floor(e.clientX - rect.left),
    y: Math.floor(e.clientY - rect.top)
  }
})

document.addEventListener("keydown", (e) => {
  if (!running) return

  lastAction = {
    type: "type",
    text: e.key
  }
})

screen.addEventListener("wheel", (e) => {
  if (!running) return

  lastAction = {
    type: "scroll",
    y: e.deltaY
  }
})
