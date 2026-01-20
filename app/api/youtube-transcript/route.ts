import { type NextRequest, NextResponse } from "next/server"

// YouTube transcript fetcher - improved approach

function getVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchTranscript(
  videoId: string,
): Promise<{ text: string; segments: Array<{ text: string; start: number; duration: number }> }> {
  // Fetch the video page to extract caption track info
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  
  const response = await fetch(watchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch video page")
  }

  const html = await response.text()

  // Look for captionTracks in the page data
  const captionTracksMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/)
  
  if (!captionTracksMatch) {
    // Try alternative pattern
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/)
    if (playerResponseMatch) {
      try {
        const playerResponse = JSON.parse(playerResponseMatch[1])
        const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks
        if (captions && captions.length > 0) {
          return await fetchFromCaptionTrack(captions)
        }
      } catch {
        // Continue to fallback
      }
    }
    throw new Error("No captions available for this video")
  }

  try {
    // Parse caption tracks - handle escaped JSON
    let captionTracksJson = captionTracksMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\\\u/g, "\\u")
    
    const captionTracks = JSON.parse(captionTracksJson)
    return await fetchFromCaptionTrack(captionTracks)
  } catch (parseError) {
    // Fallback: try to find baseUrl directly
    const baseUrlMatch = html.match(/"baseUrl"\s*:\s*"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/)
    if (baseUrlMatch) {
      const baseUrl = baseUrlMatch[1].replace(/\\u0026/g, "&")
      return await fetchTranscriptFromUrl(baseUrl)
    }
    throw new Error("Failed to parse caption data")
  }
}

async function fetchFromCaptionTrack(
  captionTracks: Array<{ baseUrl: string; languageCode?: string; name?: { simpleText?: string } }>
): Promise<{ text: string; segments: Array<{ text: string; start: number; duration: number }> }> {
  // Prefer English tracks
  const englishTrack = captionTracks.find(
    (track) => 
      track.languageCode === "en" || 
      track.languageCode === "en-US" ||
      track.languageCode === "en-GB" ||
      track.name?.simpleText?.toLowerCase().includes("english")
  )
  
  const track = englishTrack || captionTracks[0]
  
  if (!track?.baseUrl) {
    throw new Error("No valid caption track found")
  }

  let baseUrl = track.baseUrl.replace(/\\u0026/g, "&")
  return await fetchTranscriptFromUrl(baseUrl)
}

async function fetchTranscriptFromUrl(
  baseUrl: string
): Promise<{ text: string; segments: Array<{ text: string; start: number; duration: number }> }> {
  // Try JSON format first
  const jsonUrl = baseUrl.includes("fmt=") ? baseUrl.replace(/fmt=[^&]+/, "fmt=json3") : `${baseUrl}&fmt=json3`
  
  try {
    const response = await fetch(jsonUrl)
    if (response.ok) {
      const data = await response.json()
      return parseTranscriptJson3(data)
    }
  } catch {
    // Fall through to XML
  }

  // Fallback to XML format
  const xmlUrl = baseUrl.replace(/fmt=[^&]+/, "").replace(/&&/g, "&")
  const response = await fetch(xmlUrl)
  
  if (!response.ok) {
    throw new Error("Failed to fetch transcript")
  }

  const xml = await response.text()
  return parseTranscriptXml(xml)
}

function parseTranscriptJson3(data: { events?: Array<{ tStartMs?: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }> }): {
  text: string
  segments: Array<{ text: string; start: number; duration: number }>
} {
  const segments: Array<{ text: string; start: number; duration: number }> = []

  if (data.events) {
    for (const event of data.events) {
      if (event.segs) {
        const text = event.segs
          .map((seg) => seg.utf8 || "")
          .join("")
          .trim()
        if (text && text !== "\n") {
          segments.push({
            text: decodeHtmlEntities(text),
            start: (event.tStartMs || 0) / 1000,
            duration: (event.dDurationMs || 0) / 1000,
          })
        }
      }
    }
  }

  return formatSegments(segments)
}

function parseTranscriptXml(xml: string): {
  text: string
  segments: Array<{ text: string; start: number; duration: number }>
} {
  const segments: Array<{ text: string; start: number; duration: number }> = []
  
  // Parse XML transcript format: <text start="0" dur="5.2">Hello world</text>
  const textMatches = xml.matchAll(/<text[^>]*start="([^"]*)"[^>]*dur="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g)
  
  for (const match of textMatches) {
    const start = parseFloat(match[1]) || 0
    const duration = parseFloat(match[2]) || 0
    const text = decodeHtmlEntities(match[3])
    
    if (text.trim()) {
      segments.push({ text: text.trim(), start, duration })
    }
  }

  return formatSegments(segments)
}

function formatSegments(segments: Array<{ text: string; start: number; duration: number }>): {
  text: string
  segments: Array<{ text: string; start: number; duration: number }>
} {
  // Combine into paragraphs (group by ~30 second intervals)
  const paragraphs: string[] = []
  let currentParagraph: string[] = []
  let lastTime = 0

  for (const segment of segments) {
    if (segment.start - lastTime > 30 && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(" "))
      currentParagraph = []
    }
    currentParagraph.push(segment.text)
    lastTime = segment.start
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(" "))
  }

  const fullText = paragraphs.map((p) => `<p>${p}</p>`).join("\n\n")

  return { text: fullText, segments }
}

async function getVideoMetadata(
  videoId: string,
): Promise<{ title: string; author: string; thumbnail: string; duration: string }> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  const response = await fetch(oembedUrl)

  if (!response.ok) {
    throw new Error("Failed to fetch video metadata")
  }

  const data = await response.json()

  return {
    title: data.title || "Untitled Video",
    author: data.author_name || "Unknown",
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: "",
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const videoId = getVideoId(url)

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    // Fetch metadata and transcript in parallel
    const [metadata, transcript] = await Promise.all([
      getVideoMetadata(videoId),
      fetchTranscript(videoId).catch((err) => {
        console.error("[v0] Transcript fetch failed:", err.message)
        return { text: "", segments: [] }
      }),
    ])

    return NextResponse.json({
      success: true,
      videoId,
      title: metadata.title,
      author: metadata.author,
      thumbnail: metadata.thumbnail,
      transcript: transcript.text,
      segments: transcript.segments,
      hasTranscript: transcript.text.length > 0,
    })
  } catch (error) {
    console.error("[v0] YouTube transcript error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch transcript",
      },
      { status: 500 },
    )
  }
}
