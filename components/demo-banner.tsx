"use client"

import { Button } from "@/components/ui/button"
import { X, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user is in demo mode
    const isDemoMode = localStorage.getItem("the-margin-demo-mode") === "true"
    const wasDismissed = localStorage.getItem("the-margin-demo-banner-dismissed") === "true"
    setIsVisible(isDemoMode && !wasDismissed)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem("the-margin-demo-banner-dismissed", "true")
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white px-4 py-2.5 flex items-center justify-between gap-4 relative overflow-hidden">
      {/* Background pattern */}
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

      <div className="flex items-center gap-3 relative z-10">
        <Sparkles className="h-4 w-4 text-violet-200" />
        <p className="text-sm font-medium">
          You&apos;re exploring The Margin in demo mode.{" "}
          <span className="text-violet-200">Create an account to save your articles and sync across devices.</span>
        </p>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <Link href="/auth/sign-up">
          <Button size="sm" className="bg-white text-violet-700 hover:bg-violet-50 font-medium h-7 px-3 text-xs">
            Sign up free
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-violet-200 hover:text-white hover:bg-violet-500/50"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
