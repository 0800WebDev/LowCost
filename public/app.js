const frame = document.getElementById("frame")
const screen = document.getElementById("screen")

let currentUrl = ""
let lastAction = null
let running = false

// Mode switch function
function go() {
  const url = document.getElementById("url").value
  const mode = document.getElementById("mode").value

  running = false
  screen.style.display = "none"
  frame.style.display = "block"

  // Reset frame and screen
  frame.src = ""
  screen.src = ""

  switch (mode) {
    case "web":
      frame.src = "/web?url=" + encodeURIComponent(url)
      break
    case "browser":
      frame.style.display = "none"
      screen.style.display = "block"
      startBrowser(url)
      break
    case "iframe":
      frame.src = url
      break
    case "embed":
      frame.src = url
      frame.setAttribute("type", "embed")
      break
    case "object":
      frame.src = url
      frame.setAttribute("type", "object")
      break
  }
}

// Browser mode start
function startBrowser(url) {
  currentUrl = url
  running = true
  loop()
}

// Browser mode loop
async function loop() {
  if (!running) return

  try {
    const actionParam = lastAction ? "&action=" + encodeURIComponent(JSON.stringify(lastAction)) : ""
    lastAction = null

    const res = await fetch("/screenshot?url=" + encodeURIComponent(currentUrl) + actionParam)
    const data = await res.json()

    if (data.screenshot) {
      screen.src = "data:image/png;base64," + data.screenshot
    }
  } catch (e) {
    console.error("Screenshot loop error:", e)
  }

  setTimeout(loop, 200)
}

// Capture clicks on browser mode
screen.addEventListener("click", (e) => {
  if (!running) return
  const rect = screen.getBoundingClientRect()

  const x = Math.floor(e.clientX - rect.left)
  const y = Math.floor(e.clientY - rect.top)

  lastAction = { type: "click", x, y }
})

// Capture keyboard input
document.addEventListener("keydown", (e) => {
  if (!running) return

  lastAction = { type: "type", text: e.key }
})

// Capture scroll/wheel
screen.addEventListener("wheel", (e) => {
  if (!running) return
  lastAction = { type: "scroll", y: e.deltaY }
})}

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


screen.addEventListener("click", (e) => {
  const rect = screen.getBoundingClientRect()

  const x = Math.floor((e.clientX - rect.left))
  const y = Math.floor((e.clientY - rect.top))

  lastAction = {
    type: "click",
    x,
    y
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
  lastAction = {
    type: "scroll",
    y: e.deltaY
  }
})


// remove this maybe
  loop()
  }
