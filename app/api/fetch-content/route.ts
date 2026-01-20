import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheMargin/1.0; +https://themargin.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch article" }, { status: response.status })
    }

    const html = await response.text()

    // Parse the HTML to extract content
    const parsed = parseArticleContent(html, url)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch article content" }, { status: 500 })
  }
}

function parseArticleContent(html: string, url: string) {
  // Extract metadata
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : ""

  // Extract Open Graph / meta description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  const description = ogDescMatch?.[1] || metaDescMatch?.[1] || ""

  // Extract author
  const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i)
  const ogAuthorMatch = html.match(/<meta[^>]*property=["']article:author["'][^>]*content=["']([^"']+)["']/i)
  const author = authorMatch?.[1] || ogAuthorMatch?.[1] || ""

  // Extract main image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  const mainImage = ogImageMatch?.[1] || ""

  // Extract article content - try multiple selectors
  let content = ""
  const images: string[] = []

  // Try to find article content in common containers
  const articlePatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<div[^>]*class=["'][^"']*(?:post-content|article-content|entry-content|content-body|prose)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
  ]

  for (const pattern of articlePatterns) {
    const match = pattern.exec(html)
    if (match && match[1]) {
      content = match[1]
      break
    }
  }

  // If no article container found, try to extract from body
  if (!content) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      content = bodyMatch[1]
    }
  }

  // Clean up the content
  content = cleanContent(content)

  // Extract images from content
  const imgMatches = content.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)
  for (const match of imgMatches) {
    const imgSrc = match[1]
    if (imgSrc && !imgSrc.includes("data:") && !imgSrc.includes("tracking")) {
      // Make relative URLs absolute
      const absoluteUrl = imgSrc.startsWith("http") ? imgSrc : new URL(imgSrc, url).href
      images.push(absoluteUrl)
    }
  }

  // Add main OG image if not already in images
  if (mainImage && !images.includes(mainImage)) {
    images.unshift(mainImage)
  }

  // Convert content to clean readable format
  const cleanedContent = htmlToReadableContent(content)

  return {
    title,
    author,
    description,
    content: cleanedContent,
    images: images.slice(0, 10), // Limit to 10 images
    mainImage,
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function cleanContent(html: string): string {
  // Remove scripts, styles, and other non-content elements
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
}

function htmlToReadableContent(html: string): string {
  // Convert HTML to a cleaner format while preserving structure
  const content = html
    // Preserve headings with markdown-style markers
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n## $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n### $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n#### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n##### $1\n")
    // Preserve paragraphs
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
    // Preserve line breaks
    .replace(/<br\s*\/?>/gi, "\n")
    // Preserve lists
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n• $1")
    // Preserve blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n")
    // Preserve strong/bold
    .replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**")
    // Preserve em/italic
    .replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*")
    // Preserve links
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2")
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim()

  return content
}
