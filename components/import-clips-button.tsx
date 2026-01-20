"use client"

import { useState, useEffect } from "react"
import { Check, Loader2, Copy, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useArticleStore } from "@/lib/store"
import type { Article } from "@/lib/types"

interface ImportClipsButtonProps {
  onClose?: () => void
  isModal?: boolean
}

export function ImportClipsButton({ onClose, isModal }: ImportClipsButtonProps) {
  const [loading, setLoading] = useState(false)
  const [pendingClips, setPendingClips] = useState<Article[]>([])
  const [imported, setImported] = useState(false)
  const [claimCode, setClaimCode] = useState("")
  const [copied, setCopied] = useState(false)
  const addArticle = useArticleStore((s) => s.addArticle)
  const updateArticleContent = useArticleStore((s) => s.updateArticleContent)
  const articles = useArticleStore((s) => s.articles)

  // Load or generate claim code on mount
  useEffect(() => {
    const stored = localStorage.getItem("themargin-claim-code")
    if (stored) {
      setClaimCode(stored)
    } else {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      setClaimCode(newCode)
      localStorage.setItem("themargin-claim-code", newCode)
    }
  }, [])

  // Check for clips when modal opens
  useEffect(() => {
    if (isModal) {
      checkForClips()
    }
  }, [isModal])

  const regenerateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setClaimCode(newCode)
    localStorage.setItem("themargin-claim-code", newCode)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(claimCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const checkForClips = async () => {
    if (!claimCode) return

    setLoading(true)
    try {
      const res = await fetch(`/api/clip?code=${claimCode}`)
      const data = await res.json()

      const existingUrls = new Set(articles.map((a) => a.url))
      const newClips = (data.articles || []).filter((clip: Article) => !existingUrls.has(clip.url))

      setPendingClips(newClips)
    } catch (error) {
      console.error("Failed to check for clips:", error)
      setPendingClips([])
    }
    setLoading(false)
  }

  const importClips = async () => {
    setLoading(true)

    for (const clip of pendingClips) {
      const articleId = addArticle({
        title: clip.title,
        url: clip.url,
        source: clip.source,
        author: clip.author || "",
        excerpt: clip.excerpt || "",
        imageUrl: clip.imageUrl,
        tags: clip.tags || [],
        isFavorite: false,
        isArchived: false,
      })

      if (clip.content) {
        updateArticleContent(articleId, clip.content, [])
      }
    }

    await fetch(`/api/clip?code=${claimCode}`, { method: "DELETE" })

    setImported(true)
    setLoading(false)

    setTimeout(() => {
      onClose?.()
      setImported(false)
      setPendingClips([])
    }, 1500)
  }

  if (isModal) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Import Clipped Articles</h2>
            <p className="text-sm text-muted-foreground">Use this code in the Chrome extension to sync your clips</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Claim Code Section */}
        <div className="space-y-2 p-4 bg-accent/50 rounded-lg border border-border mb-4">
          <Label className="text-xs text-muted-foreground">Your Claim Code</Label>
          <div className="flex gap-2">
            <Input value={claimCode} readOnly className="font-mono text-lg tracking-widest text-center bg-background" />
            <Button variant="outline" size="icon" onClick={copyCode} className="shrink-0 bg-transparent">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={regenerateCode} className="shrink-0 bg-transparent">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Enter this code in the Chrome extension to link your clips</p>
        </div>

        {loading && !imported ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : imported ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">{pendingClips.length} article(s) imported!</p>
          </div>
        ) : pendingClips.length > 0 ? (
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {pendingClips.map((clip) => (
                <div key={clip.id} className="p-3 rounded-lg border border-border bg-accent/30">
                  <p className="font-medium text-sm line-clamp-1">{clip.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{clip.url}</p>
                  {clip.content && <span className="text-xs text-green-500 mt-1 inline-block">Content captured</span>}
                </div>
              ))}
            </div>
            <Button onClick={importClips} className="w-full">
              Import {pendingClips.length} Article(s)
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              No new clips found. Use the Chrome extension with your claim code to save articles.
            </p>
            <Button variant="outline" size="sm" onClick={checkForClips} className="mt-2 bg-transparent">
              Check Again
            </Button>
          </div>
        )}
      </div>
    )
  }

  return null
}
