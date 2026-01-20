import { type NextRequest, NextResponse } from "next/server"

// In-memory store for clips (in production, use a database)
// Using a Map with claim codes as keys
const clipStore = new Map<string, any[]>()

const CLIP_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

function cleanupOldClips() {
  const now = Date.now()
  for (const [code, clips] of clipStore.entries()) {
    const validClips = clips.filter((c) => now - new Date(c.createdAt).getTime() < CLIP_EXPIRY_MS)
    if (validClips.length === 0) {
      clipStore.delete(code)
    } else {
      clipStore.set(code, validClips)
    }
  }
}

// Generate a simple 6-character claim code
function generateClaimCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// API endpoint for the Chrome extension to save articles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if this is setting a claim code or saving an article
    if (body.action === "get-code") {
      const code = generateClaimCode()
      clipStore.set(code, [])
      return NextResponse.json(
        { code },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
        },
      )
    }

    const { article, claimCode } = body

    if (!claimCode) {
      return NextResponse.json(
        { error: "Claim code is required" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        },
      )
    }

    // Validate required fields
    if (!article?.title || !article?.url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        },
      )
    }

    const savedArticle = {
      id: Date.now().toString(),
      title: article.title,
      url: article.url,
      source: article.source || "other",
      author: article.author || "",
      excerpt: article.excerpt || "",
      imageUrl: article.imageUrl || "",
      tags: article.tags || [],
      highlights: [],
      isFavorite: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      content: article.fullContent || null,
      contentImages: article.contentImages || [],
      isFetchingContent: false,
    }

    // Get or create the clip queue for this claim code
    const queue = clipStore.get(claimCode.toUpperCase()) || []
    queue.push(savedArticle)
    clipStore.set(claimCode.toUpperCase(), queue)

    // Cleanup periodically
    cleanupOldClips()

    return NextResponse.json(
      {
        success: true,
        message: "Article clipped successfully",
        clipCount: queue.length,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    )
  } catch (error) {
    console.error("Error processing clip request:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimCode = searchParams.get("code")?.toUpperCase()

    if (!claimCode) {
      return NextResponse.json(
        { articles: [] },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        },
      )
    }

    const articles = clipStore.get(claimCode) || []

    return NextResponse.json(
      { articles },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      { articles: [] },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimCode = searchParams.get("code")?.toUpperCase()

    if (claimCode) {
      clipStore.delete(claimCode)
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  } catch {
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}
