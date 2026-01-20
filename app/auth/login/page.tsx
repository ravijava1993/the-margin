"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Play } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryDemo = () => {
    setIsDemoLoading(true)
    // Set demo mode flag in localStorage
    localStorage.setItem("the-margin-demo-mode", "true")
    router.push("/?demo=true")
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-violet-600 to-violet-800 relative overflow-hidden">
        {/* Diagonal stripes pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="The Margin" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-semibold text-white">The Margin</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Slow reading.
            <br />
            Deep thinking.
          </h1>
          <p className="text-violet-200 text-lg max-w-md">
            Save articles from anywhere. Read without distractions. Highlight what matters. Build your personal
            knowledge library.
          </p>
        </div>

        <div className="relative z-10 text-violet-300 text-sm">Curated reads, delivered daily.</div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Image src="/icon.png" alt="The Margin" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-semibold text-white">The Margin</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-zinc-400">Sign in to your account to continue reading</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-white font-medium py-2.5 group"
            onClick={handleTryDemo}
            disabled={isDemoLoading}
          >
            <Play className="h-4 w-4 mr-2 text-violet-400 group-hover:text-violet-300" />
            {isDemoLoading ? "Loading demo..." : "Try Demo"}
          </Button>

          <p className="text-center text-zinc-500 text-sm">
            No account needed. Explore all features with sample articles.
          </p>

          <p className="text-center text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
