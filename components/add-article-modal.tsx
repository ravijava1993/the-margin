"use client"

import type React from "react"

import { useState } from "react"
import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Link, Linkedin, FileText, Twitter, BookOpen, Globe, Loader2 } from "lucide-react"
import type { ArticleSource } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AddArticleModalProps {
  onClose: () => void
}

const sources: { value: ArticleSource; label: string; icon: React.ReactNode }[] = [
  { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { value: "substack", label: "Substack", icon: <FileText className="h-4 w-4" /> },
  { value: "x", label: "X (Twitter)", icon: <Twitter className="h-4 w-4" /> },
  { value: "medium", label: "Medium", icon: <BookOpen className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Globe className="h-4 w-4" /> },
]

async function fetchArticleContent(
  articleId: string,
  url: string,
  updateContent: (id: string, content: string, images: string[]) => void,
  setFetching: (id: string, isFetching: boolean, error?: string) => void,
) {
  try {
    const response = await fetch("/api/fetch-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch content")
    }

    const data = await response.json()
    updateContent(articleId, data.content, data.images || [])
  } catch (error) {
    setFetching(articleId, false, error instanceof Error ? error.message : "Failed to fetch content")
  }
}

export function AddArticleModal({ onClose }: AddArticleModalProps) {
  const { addArticle, updateArticleContent, setArticleFetching } = useArticleStore()

  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [source, setSource] = useState<ArticleSource>("other")
  const [tagsInput, setTagsInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const detectSource = (url: string): ArticleSource => {
    if (url.includes("linkedin.com")) return "linkedin"
    if (url.includes("substack.com")) return "substack"
    if (url.includes("x.com") || url.includes("twitter.com")) return "x"
    if (url.includes("medium.com")) return "medium"
    return "other"
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    setSource(detectSource(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !url.trim()) return

    setIsSaving(true)

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const articleId = addArticle({
      title: title.trim(),
      url: url.trim(),
      source,
      author: author.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      tags,
      isFavorite: false,
      isArchived: false,
    })

    // Close modal immediately and fetch content in background
    onClose()

    // Fetch content automatically
    fetchArticleContent(articleId, url.trim(), updateArticleContent, setArticleFetching)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Add New Article</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Article URL *</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                    source === s.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                  )}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Summary / Key Takeaway</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary or why you saved this article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="productivity, ai, design (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Article"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
