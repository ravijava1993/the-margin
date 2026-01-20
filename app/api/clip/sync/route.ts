import { type NextRequest, NextResponse } from "next/server"

// Endpoint for syncing clipped articles from extension storage
export async function GET(request: NextRequest) {
  // This endpoint can be polled by the dashboard to check for new clips
  // In production, you'd use a database or real-time sync
  return NextResponse.json({
    message: "Use localStorage sync or connect a database for persistence",
    timestamp: new Date().toISOString(),
  })
}
