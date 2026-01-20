"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { SourceLogo } from "@/components/source-logo"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Loader2, ChevronRight } from "lucide-react"
import { useArticleStore } from "@/lib/store"

interface Recommendation {
  id: string
  article_title: string
  article_url: string
  article_author: string | null
  article_excerpt: string | null
  article_image: string | null
  article_source: string | null
  admin_note: string | null
  position: number
}

export function DailyPicks() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const { articles, addArticle } = useArticleStore()
  const supabase = createClient()

  useEffect(() => {
    loadTodaysRecommendations()
  }, [])

  async function loadTodaysRecommendations() {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase.from("daily_recommendations").select("*").eq("date", today).order("position")

    if (!error && data) {
      setRecommendations(data)
    }
    setIsLoading(false)
  }

  async function saveToLibrary(rec: Recommendation) {
    const alreadySaved = articles.some((a) => a.url === rec.article_url)
    if (alreadySaved) return

    setSavingId(rec.id)

    addArticle({
      title: rec.article_title,
      url: rec.article_url,
      author: rec.article_author || undefined,
      source: (rec.article_source as "linkedin" | "substack" | "x" | "medium" | "youtube" | "other") || "other",
      excerpt: rec.article_excerpt || undefined,
      image: rec.article_image || undefined,
      tags: ["daily-picks"],
    })

    setSavingId(null)
  }

  function isAlreadySaved(url: string) {
    return articles.some((a) => a.url === url)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="border-b border-border">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="font-medium text-sm">Today&apos;s Picks</span>
          <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
            {recommendations.length}
          </span>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Recommendations */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {recommendations.map((rec) => {
            const saved = isAlreadySaved(rec.article_url)

            return (
              <div
                key={rec.id}
                className="group p-3 rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent border border-violet-500/10 hover:border-violet-500/20 transition-all"
              >
                <div className="flex gap-3">
                  {/* Image */}
                  {rec.article_image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                      <img
                        src={rec.article_image || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <SourceLogo source={rec.article_source || "other"} size={14} />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {rec.article_source || "Article"}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium leading-snug line-clamp-2">{rec.article_title}</h4>
                    {rec.article_author && <p className="text-xs text-muted-foreground mt-0.5">by {rec.article_author}</p>}
                  </div>
                </div>

                {/* Admin note */}
                {rec.admin_note && (
                  <p className="mt-2 text-xs text-violet-300/80 italic pl-1 border-l-2 border-violet-500/30">
                    &quot;{rec.admin_note}&quot;
                  </p>
                )}

                {/* Save button */}
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant={saved ? "outline" : "default"}
                    disabled={saved || savingId === rec.id}
                    onClick={() => saveToLibrary(rec)}
                    className={`w-full text-xs h-8 ${saved ? "border-green-500/30 text-green-400" : "bg-violet-600 hover:bg-violet-700"}`}
                  >
                    {savingId === rec.id ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : saved ? (
                      "Saved to Library"
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Save to Library
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
