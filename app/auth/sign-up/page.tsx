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

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
            Join the slow
            <br />
            reading movement.
          </h1>
          <p className="text-violet-200 text-lg max-w-md">
            Build your personal reading library. Highlight insights. Create flashcards. Track your progress.
          </p>
        </div>

        <div className="relative z-10 text-violet-300 text-sm">Free to use. No credit card required.</div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Image src="/icon.png" alt="The Margin" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-semibold text-white">The Margin</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Create your account</h2>
            <p className="text-zinc-400">Start building your reading library today</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-zinc-300">
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-zinc-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
