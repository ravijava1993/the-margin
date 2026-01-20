"use client"

import { useEffect, useState } from "react"
import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Download, Check, X } from "lucide-react"

// Component to sync articles from the Chrome extension
export function ExtensionSync() {
  const [pendingArticles, setPendingArticles] = useState<any[]>([])
  const [showSync, setShowSync] = useState(false)
  const { addArticle } = useArticleStore()

  useEffect(() => {
    // Check for clipped articles in URL params (from extension)
    const checkForClips = () => {
      const params = new URLSearchParams(window.location.search)
      const clipData = params.get("clip")

      if (clipData) {
        try {
          const article = JSON.parse(decodeURIComponent(clipData))
          setPendingArticles([article])
          setShowSync(true)
          // Clean URL
          window.history.replaceState({}, "", window.location.pathname)
        } catch (e) {
          console.error("Failed to parse clip data", e)
        }
      }
    }

    checkForClips()

    // Listen for messages from extension
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "THEMARGIN_CLIP") {
        setPendingArticles((prev) => [...prev, event.data.article])
        setShowSync(true)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const importArticle = (article: any) => {
    addArticle({
      title: article.title,
      url: article.url,
      source: article.source,
      author: article.author,
      excerpt: article.excerpt,
      imageUrl: article.imageUrl,
      tags: article.tags || [],
      isFavorite: false,
      isArchived: false,
    })

    // If there's a highlight, add it
    // Note: We'd need to get the new article ID and add highlight separately

    setPendingArticles((prev) => prev.filter((a) => a.url !== article.url))
    if (pendingArticles.length <= 1) {
      setShowSync(false)
    }
  }

  const dismissArticle = (url: string) => {
    setPendingArticles((prev) => prev.filter((a) => a.url !== url))
    if (pendingArticles.length <= 1) {
      setShowSync(false)
    }
  }

  if (!showSync || pendingArticles.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-lg p-4 w-80 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 mb-3">
        <Download className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">New Clipped Article</span>
      </div>

      {pendingArticles.map((article) => (
        <div key={article.url} className="mb-3 last:mb-0">
          <p className="text-sm font-medium line-clamp-2 mb-2">{article.title}</p>
          <p className="text-xs text-muted-foreground mb-3">{article.source}</p>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => importArticle(article)} className="flex-1">
              <Check className="h-3 w-3 mr-1" />
              Import
            </Button>
            <Button size="sm" variant="outline" onClick={() => dismissArticle(article.url)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
