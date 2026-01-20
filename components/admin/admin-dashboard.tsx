"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Loader2, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SourceLogo } from "@/components/source-logo"

interface Recommendation {
  id: string
  date: string
  position: number
  article_title: string
  article_url: string
  article_author: string | null
  article_excerpt: string | null
  article_image: string | null
  article_source: string | null
  admin_note: string | null
}

function detectSource(url: string): string {
  if (url.includes("linkedin.com")) return "linkedin"
  if (url.includes("substack.com") || url.includes(".substack.")) return "substack"
  if (url.includes("twitter.com") || url.includes("x.com")) return "x"
  if (url.includes("medium.com")) return "medium"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
  return "other"
}

export function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [isFetching, setIsFetching] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadRecommendations()
  }, [selectedDate])

  async function loadRecommendations() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("daily_recommendations")
      .select("*")
      .eq("date", selectedDate)
      .order("position")

    if (!error && data) {
      setRecommendations(data)
    }
    setIsLoading(false)
  }

  async function fetchArticleMetadata(url: string) {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/fetch-content?url=${encodeURIComponent(url)}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return {
        title: data.title || "Untitled",
        author: data.author || null,
        excerpt: data.excerpt || null,
        image: data.image || null,
        source: detectSource(url),
      }
    } catch {
      return {
        title: "Untitled Article",
        author: null,
        excerpt: null,
        image: null,
        source: detectSource(url),
      }
    } finally {
      setIsFetching(false)
    }
  }

  async function addRecommendation() {
    if (!newUrl.trim() || recommendations.length >= 5) return

    const metadata = await fetchArticleMetadata(newUrl)

    const newRec = {
      date: selectedDate,
      position: recommendations.length + 1,
      article_url: newUrl,
      article_title: metadata.title,
      article_author: metadata.author,
      article_excerpt: metadata.excerpt,
      article_image: metadata.image,
      article_source: metadata.source,
      admin_note: null,
    }

    setIsSaving(true)
    const { data, error } = await supabase.from("daily_recommendations").insert(newRec).select().single()

    if (!error && data) {
      setRecommendations([...recommendations, data])
      setNewUrl("")
    }
    setIsSaving(false)
  }

  async function updateRecommendation(id: string, updates: Partial<Recommendation>) {
    const { error } = await supabase.from("daily_recommendations").update(updates).eq("id", id)

    if (!error) {
      setRecommendations(recommendations.map((r) => (r.id === id ? { ...r, ...updates } : r)))
    }
  }

  async function deleteRecommendation(id: string) {
    const { error } = await supabase.from("daily_recommendations").delete().eq("id", id)

    if (!error) {
      const updated = recommendations.filter((r) => r.id !== id)
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].position !== i + 1) {
          await supabase
            .from("daily_recommendations")
            .update({ position: i + 1 })
            .eq("id", updated[i].id)
          updated[i].position = i + 1
        }
      }
      setRecommendations(updated)
    }
  }

  function navigateDate(direction: number) {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + direction)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Image src="/icon.png" alt="The Margin" width={32} height={32} className="rounded-lg" />
              <div>
                <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                <p className="text-xs text-zinc-500">Curate daily recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">{formattedDate}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate(-1)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate(1)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Add Article */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Add Recommendation ({recommendations.length}/5)
          </h3>
          <div className="flex gap-3">
            <Input
              placeholder="Paste article URL..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={recommendations.length >= 5 || isFetching}
              className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              onKeyDown={(e) => e.key === "Enter" && addRecommendation()}
            />
            <Button
              onClick={addRecommendation}
              disabled={!newUrl.trim() || recommendations.length >= 5 || isFetching || isSaving}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {isFetching ? "Fetching..." : "Add"}
            </Button>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Today&apos;s Picks</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
              <p className="text-zinc-500">No recommendations for this date</p>
              <p className="text-zinc-600 text-sm mt-1">Add articles above to curate today&apos;s picks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={rec.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex gap-4">
                    {/* Position number */}
                    <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-400 font-semibold">{index + 1}</span>
                    </div>

                    {/* Article image */}
                    {rec.article_image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <SourceLogo source={rec.article_source || "other"} size={16} />
                            <span className="text-xs text-zinc-500 capitalize">{rec.article_source || "Article"}</span>
                          </div>
                          <h4 className="text-white font-medium truncate">{rec.article_title}</h4>
                          {rec.article_author && <p className="text-sm text-zinc-500">by {rec.article_author}</p>}
                          {rec.article_excerpt && <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{rec.article_excerpt}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={rec.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRecommendation(rec.id)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Admin note */}
                      <div className="mt-4">
                        <label className="text-xs text-zinc-500 mb-1 block">Why I recommend this</label>
                        <Textarea
                          placeholder="Add a note for your readers..."
                          value={rec.admin_note || ""}
                          onChange={(e) => updateRecommendation(rec.id, { admin_note: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
