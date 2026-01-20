// Detect source from URL
function detectSource(url) {
  if (url.includes("linkedin.com")) return "linkedin"
  if (url.includes("substack.com") || url.includes(".substack.")) return "substack"
  if (url.includes("twitter.com") || url.includes("x.com")) return "x"
  if (url.includes("medium.com")) return "medium"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
  return "other"
}

// Get source display name
function getSourceName(source) {
  const names = {
    linkedin: "LinkedIn",
    substack: "Substack",
    x: "X (Twitter)",
    medium: "Medium",
    youtube: "YouTube",
    other: "Web",
  }
  return names[source] || "Web"
}

function getSourceIcon(source) {
  const icons = {
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>`,
    substack: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
    </svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>`,
    medium: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-5.75 3.39-5.75 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    </svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>`,
    other: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,
  }
  return icons[source] || icons.other
}

// Get suggested tags based on source
function getSuggestedTags(source) {
  const tags = {
    linkedin: ["professional", "career", "business"],
    substack: ["newsletter", "opinion", "analysis"],
    x: ["thread", "discussion", "trending"],
    medium: ["blog", "tech", "stories"],
    youtube: ["video", "tutorial", "learning"],
    other: ["article", "reading"],
  }
  return tags[source] || ["article"]
}

function updateStatus(text, type = "default") {
  const statusEl = document.getElementById("status")
  const statusTextEl = document.getElementById("status-text")

  statusTextEl.textContent = text
  statusEl.className = `status ${type}`

  const iconEl = statusEl.querySelector(".status-icon")

  if (type === "success") {
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`
  } else if (type === "error") {
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`
  } else if (type === "loading") {
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
      <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
    </svg>`
  } else {
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`
  }
}

async function fetchYouTubeTranscript(url, dashboardUrl) {
  const apiUrl = dashboardUrl.replace(/\/$/, "") + "/api/youtube-transcript"
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch transcript")
  }

  return response.json()
}

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
  const formEl = document.getElementById("clip-form")
  const titleEl = document.getElementById("title")
  const authorEl = document.getElementById("author")
  const excerptEl = document.getElementById("excerpt")
  const sourceEl = document.getElementById("source")
  const sourceNameEl = document.getElementById("source-name")
  const tagsEl = document.getElementById("tags")
  const dashboardUrlEl = document.getElementById("dashboard-url")
  const claimCodeEl = document.getElementById("claim-code")
  const saveBtn = document.getElementById("save-btn")
  const previewCard = document.getElementById("preview-card")
  const wordCountEl = document.getElementById("word-count")
  const imageCountEl = document.getElementById("image-count")
  const readTimeEl = document.getElementById("read-time")

  // Load saved settings
  const stored = await window.chrome.storage.local.get(["dashboardUrl", "claimCode"])
  if (stored.dashboardUrl) {
    dashboardUrlEl.value = stored.dashboardUrl
  }
  if (stored.claimCode) {
    claimCodeEl.value = stored.claimCode
  }

  // Get current tab
  const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab || !tab.url) {
    updateStatus("Cannot access this page", "error")
    return
  }

  const url = tab.url
  const source = detectSource(url)

  sourceEl.innerHTML = getSourceIcon(source) + `<span id="source-name">${getSourceName(source)}</span>`
  sourceEl.className = `source-badge source-${source}`

  // Set suggested tags
  tagsEl.value = getSuggestedTags(source).join(", ")

  if (source === "youtube") {
    updateStatus("Fetching video transcript...", "loading")

    // For YouTube, we need the dashboard URL to fetch transcript
    const dashboardUrl = dashboardUrlEl.value.trim()

    if (!dashboardUrl) {
      // Show basic info first, transcript will be fetched on save
      titleEl.value = tab.title?.replace(" - YouTube", "") || ""
      formEl.dataset.pageUrl = url
      formEl.dataset.isYouTube = "true"
      updateStatus("Enter dashboard URL to fetch transcript", "default")
      formEl.style.display = "block"
      return
    }

    try {
      const ytData = await fetchYouTubeTranscript(url, dashboardUrl)

      titleEl.value = ytData.title || tab.title?.replace(" - YouTube", "") || ""
      authorEl.value = ytData.author || ""
      excerptEl.value = ytData.hasTranscript ? "Video transcript available" : "No transcript available"
      formEl.dataset.fullContent = ytData.transcript || ""
      formEl.dataset.imageUrl = ytData.thumbnail || ""
      formEl.dataset.pageUrl = url
      formEl.dataset.contentImages = JSON.stringify([ytData.thumbnail].filter(Boolean))
      formEl.dataset.isYouTube = "true"

      if (ytData.transcript) {
        const wordCount = ytData.transcript
          .replace(/<[^>]*>/g, " ")
          .split(/\s+/)
          .filter(Boolean).length
        const readTime = Math.max(1, Math.ceil(wordCount / 200))

        wordCountEl.textContent = wordCount.toLocaleString()
        imageCountEl.textContent = "1"
        readTimeEl.textContent = readTime
        previewCard.style.display = "block"

        updateStatus("Transcript captured!", "success")
      } else {
        updateStatus("Video saved (no transcript)", "default")
      }

      formEl.style.display = "block"
    } catch (err) {
      console.error("Error fetching YouTube data:", err)
      titleEl.value = tab.title?.replace(" - YouTube", "") || ""
      formEl.dataset.pageUrl = url
      formEl.dataset.isYouTube = "true"
      updateStatus(err.message || "Could not fetch transcript", "error")
      formEl.style.display = "block"
    }

    return
  }

  // Try to get metadata from page (non-YouTube)
  updateStatus("Extracting article content...", "loading")

  try {
    // Inject content script and get metadata
    const results = await window.chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContent,
    })

    const metadata = results[0]?.result || {}

    titleEl.value = metadata.title || tab.title || ""
    authorEl.value = metadata.author || ""
    excerptEl.value = metadata.excerpt || ""
    formEl.dataset.fullContent = metadata.fullContent || ""
    formEl.dataset.imageUrl = metadata.image || ""
    formEl.dataset.pageUrl = url
    formEl.dataset.contentImages = JSON.stringify(metadata.contentImages || [])

    if (metadata.fullContent) {
      const wordCount = metadata.fullContent
        .replace(/<[^>]*>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length
      const imageCount = (metadata.contentImages || []).length
      const readTime = Math.max(1, Math.ceil(wordCount / 200))

      wordCountEl.textContent = wordCount.toLocaleString()
      imageCountEl.textContent = imageCount
      readTimeEl.textContent = readTime
      previewCard.style.display = "block"

      updateStatus("Content captured successfully!", "success")
    } else {
      updateStatus("Ready to save (basic info only)", "default")
    }

    formEl.style.display = "block"
  } catch (err) {
    console.error("Error extracting metadata:", err)
    titleEl.value = tab.title || ""
    formEl.dataset.pageUrl = url
    updateStatus("Basic info captured", "default")
    formEl.style.display = "block"
  }

  // Handle form submission
  saveBtn.addEventListener("click", async () => {
    const dashboardUrl = dashboardUrlEl.value.trim()
    const claimCode = claimCodeEl.value.trim().toUpperCase()

    if (!dashboardUrl) {
      updateStatus("Please enter your dashboard URL", "error")
      return
    }

    if (!claimCode) {
      updateStatus("Please enter your claim code", "error")
      return
    }

    // Save settings for future use
    await window.chrome.storage.local.set({ dashboardUrl, claimCode })

    if (formEl.dataset.isYouTube === "true" && !formEl.dataset.fullContent) {
      updateStatus("Fetching transcript...", "loading")
      try {
        const ytData = await fetchYouTubeTranscript(formEl.dataset.pageUrl, dashboardUrl)
        formEl.dataset.fullContent = ytData.transcript || ""
        formEl.dataset.imageUrl = ytData.thumbnail || formEl.dataset.imageUrl
        if (ytData.title) titleEl.value = ytData.title
        if (ytData.author) authorEl.value = ytData.author
      } catch (err) {
        console.log("Could not fetch transcript:", err.message)
      }
    }

    const articleData = {
      title: titleEl.value.trim(),
      author: authorEl.value.trim(),
      excerpt: excerptEl.value.trim(),
      url: formEl.dataset.pageUrl,
      source: source,
      tags: tagsEl.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl: formEl.dataset.imageUrl || "",
      fullContent: formEl.dataset.fullContent || "",
      contentImages: JSON.parse(formEl.dataset.contentImages || "[]"),
    }

    updateStatus("Saving to The Margin...", "loading")
    saveBtn.disabled = true

    try {
      const apiUrl = dashboardUrl.replace(/\/$/, "") + "/api/clip"
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: articleData, claimCode }),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      const result = await response.json()
      const clipCount = result.clipCount || 1

      updateStatus(`Saved! ${clipCount} clip(s) pending import.`, "success")

      saveBtn.textContent = "✓ Saved"
      saveBtn.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"

      setTimeout(() => {
        saveBtn.textContent = "Save to The Margin"
        saveBtn.style.background = ""
        saveBtn.disabled = false
      }, 2000)
    } catch (err) {
      console.error("Error saving:", err)
      updateStatus("Error saving. Check dashboard URL.", "error")
      saveBtn.disabled = false
    }
  })
})

// This function runs in the context of the web page
function extractPageContent() {
  // Get meta tags
  const getMeta = (name) => {
    const el = document.querySelector(
      `meta[property="${name}"], meta[name="${name}"], meta[property="og:${name}"], meta[name="twitter:${name}"]`,
    )
    return el?.content || ""
  }

  const getArticleContent = () => {
    // Try common article selectors
    const selectors = [
      "article",
      '[role="article"]',
      ".post-content",
      ".article-content",
      ".entry-content",
      ".post-body",
      ".article-body",
      "main article",
      ".prose",
      ".markdown-body",
      // Substack specific
      ".post-content-final",
      ".body.markup",
      ".available-content",
      // Medium specific
      "article section",
      ".pw-post-body-paragraph",
      // LinkedIn specific
      ".feed-shared-update-v2__description",
      ".share-native-main-content",
    ]

    for (const selector of selectors) {
      const el = document.querySelector(selector)
      if (el && el.innerText && el.innerText.length > 200) {
        return cleanAndPreserveContent(el)
      }
    }

    // Fallback: collect all paragraphs
    const paragraphs = document.querySelectorAll("article p, main p, .post-content p, .entry-content p")
    if (paragraphs.length > 0) {
      const container = document.createElement("div")
      paragraphs.forEach((p) => {
        if (p.innerText.trim().length > 20) {
          container.appendChild(p.cloneNode(true))
        }
      })
      return cleanAndPreserveContent(container)
    }

    return { html: "", images: [] }
  }

  const cleanAndPreserveContent = (element) => {
    // Clone to avoid modifying the page
    const clone = element.cloneNode(true)
    const images = []

    // Remove unwanted elements
    const removeSelectors = [
      "script",
      "style",
      "nav",
      "header",
      "footer",
      ".comments",
      ".related",
      ".sidebar",
      ".ad",
      ".advertisement",
      ".social-share",
      ".author-bio",
      "button",
      "form",
      ".subscription",
      ".paywall",
      "svg",
      "iframe",
      ".share",
      ".newsletter",
      "[data-ad]",
      ".promoted",
    ]
    removeSelectors.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => el.remove())
    })

    // Process and collect images with absolute URLs
    clone.querySelectorAll("img").forEach((img) => {
      let src = img.src || img.dataset.src || img.dataset.lazySrc
      if (src) {
        // Convert relative URLs to absolute
        if (src.startsWith("/")) {
          src = window.location.origin + src
        } else if (!src.startsWith("http")) {
          src = new URL(src, window.location.href).href
        }
        // Only include valid image URLs (not base64 placeholders or tracking pixels)
        if (src.startsWith("http") && !src.includes("data:") && !src.includes("pixel") && !src.includes("tracking")) {
          images.push(src)
          img.setAttribute("src", src)
          img.removeAttribute("srcset")
          img.removeAttribute("data-src")
          img.removeAttribute("loading")
        }
      }
    })

    // Clean up all elements - remove classes, styles, and data attributes
    clone.querySelectorAll("*").forEach((el) => {
      // Keep only semantic attributes
      const tagName = el.tagName.toLowerCase()
      const allowedTags = [
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "ul",
        "ol",
        "li",
        "strong",
        "b",
        "em",
        "i",
        "a",
        "img",
        "figure",
        "figcaption",
        "br",
        "hr",
        "pre",
        "code",
      ]

      // Remove all attributes except essential ones
      const attrs = Array.from(el.attributes)
      attrs.forEach((attr) => {
        if (tagName === "a" && attr.name === "href") {
          // Keep href for links, make absolute
          const href = el.getAttribute("href")
          if (href && href.startsWith("/")) {
            el.setAttribute("href", window.location.origin + href)
          }
          return
        }
        if (tagName === "img" && attr.name === "src") return
        if (tagName === "img" && attr.name === "alt") return
        el.removeAttribute(attr.name)
      })

      // Convert non-semantic divs/spans with text to paragraphs
      if ((tagName === "div" || tagName === "span") && el.children.length === 0 && el.innerText.trim()) {
        const p = document.createElement("p")
        p.textContent = el.innerText.trim()
        el.parentNode?.replaceChild(p, el)
      }
    })

    // Get the cleaned HTML
    let html = clone.innerHTML || ""

    // Clean up excessive whitespace and empty tags
    html = html
      .replace(/<div[^>]*>\s*<\/div>/gi, "")
      .replace(/<span[^>]*>\s*<\/span>/gi, "")
      .replace(/<p[^>]*>\s*<\/p>/gi, "")
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .trim()

    return { html, images: [...new Set(images)] }
  }

  const content = getArticleContent()

  return {
    title: getMeta("og:title") || getMeta("title") || document.title,
    author: getMeta("author") || getMeta("article:author"),
    excerpt: getMeta("description") || getMeta("og:description"),
    image: getMeta("og:image") || getMeta("twitter:image"),
    fullContent: content.html,
    contentImages: content.images,
  }
}
