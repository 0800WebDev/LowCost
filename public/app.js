const frame = document.getElementById("frame")
const screen = document.getElementById("screen")

let loopRunning = false

function go() {
  const url = document.getElementById("url").value
  const mode = document.getElementById("mode").value

  loopRunning = false
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
    frame.outerHTML = `<iframe id="frame" src="${url}"></iframe>`
  }

  if (mode === "embed") {
    frame.outerHTML = `<embed src="${url}">`
  }

  if (mode === "object") {
    frame.outerHTML = `<object data="${url}"></object>`
  }
}

async function startBrowser(url) {
  loopRunning = true

  async function loop() {
    if (!loopRunning) return

    try {
      const res = await fetch("/screenshot?url=" + encodeURIComponent(url))
      const data = await res.json()

      if (data.screenshot) {
        screen.src = "data:image/png;base64," + data.screenshot
      }
    } catch {}

    setTimeout(loop, 150)
  }

  loop()
  }
