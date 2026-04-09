const frame = document.getElementById("frame")
const screen = document.getElementById("screen")

let currentUrl = ""
let lastAction = null
let running = false

function go() {
  const url = document.getElementById("url").value
  const mode = document.getElementById("mode").value

  running = false
  screen.style.display = "none"
  frame.style.display = "block"

  if (mode === "web") {
    frame.src = "/web?url=" + encodeURIComponent(url)
  }

  if (mode === "browser") {
    frame.style.display = "none"
    screen.style.display = "block"
    startBrowser(url)
  }

  if (mode === "iframe") {
    frame.outerHTML = `<iframe src="${url}"></iframe>`
  }

  if (mode === "embed") {
    frame.outerHTML = `<embed src="${url}">`
  }

  if (mode === "object") {
    frame.outerHTML = `<object data="${url}"></object>`
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
    let actionParam = lastAction ? "&action=" + encodeURIComponent(JSON.stringify(lastAction)) : ""
    lastAction = null

    const res = await fetch("/screenshot?url=" + encodeURIComponent(currentUrl) + actionParam)
    const data = await res.json()

    if (data.screenshot) {
      screen.src = "data:image/png;base64," + data.screenshot
    }
  } catch {}

  setTimeout(loop, 200)
}
// remove this maybe
  loop()
  }
