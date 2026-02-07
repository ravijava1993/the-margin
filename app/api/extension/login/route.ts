import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create a Supabase client and sign in with the user's credentials
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401, headers: corsHeaders }
      )
    }

    // Fetch the user's profile for display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", data.user.id)
      .single()

    return NextResponse.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
          display_name: profile?.display_name || data.user.email,
        },
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("Extension login error:", error)
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}
