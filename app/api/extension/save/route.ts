import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      )
    }

    const accessToken = authHeader.replace("Bearer ", "")

    // Create a Supabase client with the user's access token
    // This respects RLS policies so the user can only insert their own articles
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please log in again." },
        { status: 401, headers: corsHeaders }
      )
    }

    const { article } = await request.json()

    if (!article?.title || !article?.url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if article with same URL already exists for this user
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("user_id", user.id)
      .eq("url", article.url)
      .single()

    if (existing) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Article already saved",
          duplicate: true,
          articleId: existing.id 
        },
        { headers: corsHeaders }
      )
    }

    // Insert the article directly into the user's articles table
    const { data: savedArticle, error: insertError } = await supabase
      .from("articles")
      .insert({
        user_id: user.id,
        title: article.title,
        url: article.url,
        source: article.source || "other",
        author: article.author || null,
        excerpt: article.excerpt || null,
        image: article.imageUrl || null,
        tags: article.tags || [],
        content: article.fullContent || null,
        content_images: article.contentImages || [],
        is_favorite: false,
        is_archived: false,
        is_read: false,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Error saving article:", insertError)
      return NextResponse.json(
        { error: "Failed to save article" },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Article saved to your library",
        articleId: savedArticle.id,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("Extension save error:", error)
    return NextResponse.json(
      { error: "Failed to save article" },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}
