"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  X,
  Star,
  Highlighter,
  ChevronLeft,
  BookOpen,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Archive,
  ArchiveRestore,
  Plus,
  Tag,
  MessageSquare,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Highlight } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const highlightColors: Highlight["color"][] = ["yellow", "green", "blue", "pink"]

const colorClasses: Record<Highlight["color"], string> = {
  yellow: "bg-yellow-500/20 border-yellow-500/40",
  green: "bg-green-500/20 border-green-500/40",
  blue: "bg-blue-500/20 border-blue-500/40",
  pink: "bg-pink-500/20 border-pink-500/40",
}

const inlineHighlightColors: Record<Highlight["color"], string> = {
  yellow: "bg-yellow-400/25 hover:bg-yellow-400/35 text-inherit",
  green: "bg-green-400/25 hover:bg-green-400/35 text-inherit",
  blue: "bg-blue-400/25 hover:bg-blue-400/35 text-inherit",
  pink: "bg-pink-400/25 hover:bg-pink-400/35 text-inherit",
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function applyHighlightsToContent(content: string, highlights: Highlight[]): string {
  if (!highlights.length) return content

  let result = content

  // Sort highlights by text length (longest first) to avoid partial replacements
  const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length)

  for (const highlight of sortedHighlights) {
    const escapedText = escapeRegExp(highlight.text)
    // Match the text but not if it's already inside a <mark> tag
    const regex = new RegExp(`(?<!<mark[^>]*>)${escapedText}(?![^<]*</mark>)`, "gi")
    const colorClass = inlineHighlightColors[highlight.color]

    result = result.replace(regex, (match) => {
      return `<mark class="${colorClass} rounded-sm px-0.5 py-0.5 cursor-pointer transition-colors duration-200" data-highlight-id="${highlight.id}" title="${highlight.note || "Click to view highlight"}">${match}</mark>`
    })
  }

  return result
}

export function ArticleReader() {
  const {
    articles,
    selectedArticleId,
    setSelectedArticle,
    toggleFavorite,
    toggleArchive,
    updateArticleContent,
    setArticleFetching,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    addTag,
    removeTag,
    markArticleAsRead,
    createFlashcardFromHighlight,
    flashcards,
  } = useArticleStore()

  const [showHighlights, setShowHighlights] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [showAddHighlight, setShowAddHighlight] = useState(false)
  const [newHighlightNote, setNewHighlightNote] = useState("")
  const [newHighlightColor, setNewHighlightColor] = useState<Highlight["color"]>("yellow")
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [highlightPopupPosition, setHighlightPopupPosition] = useState<{ top: number; left: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const article = articles.find((a) => a.id === selectedArticleId)

  useEffect(() => {
    if (article?.content && !article.isFetchingContent) {
      markArticleAsRead(article.id)
    }
  }, [article?.id, article?.content, article?.isFetchingContent, markArticleAsRead])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleCloseHighlight()
      }
    }

    if (showAddHighlight) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showAddHighlight])

  const handleRetryFetch = useCallback(async () => {
    if (!article) return

    setArticleFetching(article.id, true, undefined)

    try {
      const response = await fetch("/api/fetch-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.url }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch article content")
      }

      const data = await response.json()
      updateArticleContent(article.id, data.content, data.images || [])
    } catch (error) {
      setArticleFetching(article.id, false, error instanceof Error ? error.message : "Failed to fetch content")
    }
  }, [article, updateArticleContent, setArticleFetching])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim()
      setSelectedText(text)

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Use fixed viewport coordinates
      setHighlightPopupPosition({
        top: rect.bottom + 8,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336)),
      })

      setShowAddHighlight(true)
    }
  }, [])

  const handleAddHighlight = useCallback(() => {
    if (!selectedText.trim() || !article) {
      return
    }

    addHighlight(article.id, {
      text: selectedText,
      note: newHighlightNote || undefined,
      color: newHighlightColor,
    })

    setSelectedText("")
    setNewHighlightNote("")
    setShowAddHighlight(false)
    setHighlightPopupPosition(null)
    window.getSelection()?.removeAllRanges()
  }, [selectedText, article, newHighlightNote, newHighlightColor, addHighlight])

  const handleCloseHighlight = useCallback(() => {
    setShowAddHighlight(false)
    setSelectedText("")
    setNewHighlightNote("")
    setHighlightPopupPosition(null)
    window.getSelection()?.removeAllRanges()
  }, [])

  const handleSaveNote = (highlightId: string) => {
    if (!article) return
    updateHighlight(article.id, highlightId, { note: noteText || undefined })
    setEditingNote(null)
    setNoteText("")
  }

  const handleAddTag = () => {
    if (!newTag.trim() || !article) return
    addTag(article.id, newTag.trim())
    setNewTag("")
    setShowAddTag(false)
  }

  const hasFlashcard = useCallback(
    (highlightId: string) => {
      return flashcards.some((f) => f.highlightId === highlightId)
    },
    [flashcards],
  )

  const highlightedHtmlContent = useMemo(() => {
    if (!article?.content) return null

    const isHtml = article.content.includes("<p>") || article.content.includes("<h") || article.content.includes("<img")

    if (isHtml && article.highlights.length > 0) {
      return applyHighlightsToContent(article.content, article.highlights)
    }

    return article.content
  }, [article?.content, article?.highlights])

  const renderedContent = useMemo(() => {
    if (!article?.content) return null

    const isHtml = article.content.includes("<p>") || article.content.includes("<h") || article.content.includes("<img")

    if (!isHtml) {
      const contentToRender =
        article.highlights.length > 0 ? applyHighlightsToContent(article.content, article.highlights) : article.content

      return contentToRender.split("\n\n").map((paragraph, idx) => {
        if (paragraph.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-2xl font-bold mt-8 mb-4"
              dangerouslySetInnerHTML={{ __html: paragraph.replace("## ", "") }}
            />
          )
        }
        if (paragraph.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-xl font-semibold mt-6 mb-3"
              dangerouslySetInnerHTML={{ __html: paragraph.replace("### ", "") }}
            />
          )
        }
        if (paragraph.startsWith("#### ")) {
          return (
            <h4
              key={idx}
              className="text-lg font-medium mt-4 mb-2"
              dangerouslySetInnerHTML={{ __html: paragraph.replace("#### ", "") }}
            />
          )
        }
        if (paragraph.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: paragraph.replace("> ", "") }}
            />
          )
        }
        if (paragraph.startsWith("• ")) {
          return (
            <ul key={idx} className="list-disc pl-6 space-y-1">
              {paragraph.split("\n• ").map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item.replace("• ", "") }} />
              ))}
            </ul>
          )
        }
        if (paragraph.trim()) {
          return <p key={idx} className="text-foreground/90" dangerouslySetInnerHTML={{ __html: paragraph }} />
        }
        return null
      })
    }

    return null
  }, [article?.content, article?.highlights])

  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 animate-fade-in">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">Select an article</h3>
          <p className="text-sm text-muted-foreground">Choose an article from the list to start reading</p>
        </div>
      </div>
    )
  }

  const isHtmlContent =
    article.content &&
    (article.content.includes("<p>") || article.content.includes("<h") || article.content.includes("<img"))

  const safeDate = (date: Date | string) => {
    return typeof date === "string" ? new Date(date) : date
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background animate-fade-in">
      {showAddHighlight && selectedText && highlightPopupPosition && (
        <div
          ref={popupRef}
          className="fixed z-[100] animate-fade-in-up"
          style={{
            top: highlightPopupPosition.top,
            left: highlightPopupPosition.left,
            width: "320px",
          }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 backdrop-blur-sm">
            <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
              <span className="font-medium text-zinc-200">Selected:</span> "{selectedText.slice(0, 80)}
              {selectedText.length > 80 ? "..." : ""}"
            </p>
            <Input
              placeholder="Add a note (optional)"
              value={newHighlightNote}
              onChange={(e) => setNewHighlightNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddHighlight()}
              className="mb-3 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewHighlightColor(color)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-all duration-200 hover:scale-110",
                      color === "yellow" && "bg-yellow-400 border-yellow-500",
                      color === "green" && "bg-green-400 border-green-500",
                      color === "blue" && "bg-blue-400 border-blue-500",
                      color === "pink" && "bg-pink-400 border-pink-500",
                      newHighlightColor === color && "scale-110 ring-2 ring-offset-2 ring-offset-zinc-900 ring-white",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseHighlight}
                  className="h-8 px-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddHighlight}
                  className="h-8 px-4 bg-violet-600 text-white hover:bg-violet-500 transition-colors duration-200"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedArticle(null)}
            className="shrink-0 hover:bg-accent hover:-translate-x-0.5 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(safeDate(article.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(article.id)}
            title="Favorite"
            className="hover:scale-110 transition-transform duration-200"
          >
            <Star
              className={cn(
                "h-4 w-4 transition-all duration-200",
                article.isFavorite ? "fill-yellow-400 text-yellow-400 scale-110" : "",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleArchive(article.id)}
            title={article.isArchived ? "Unarchive" : "Archive"}
            className="hover:scale-110 transition-transform duration-200"
          >
            {article.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </Button>
          <Button
            variant={showHighlights ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowHighlights(!showHighlights)}
            title="Highlights"
            className="relative hover:scale-110 transition-transform duration-200"
          >
            <Highlighter className="h-4 w-4" />
            {article.highlights.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center animate-scale-in">
                {article.highlights.length}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Open original"
            className="hover:scale-110 transition-transform duration-200"
          >
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedArticle(null)}
            title="Close"
            className="hover:scale-110 hover:text-destructive transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Reader Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin" ref={contentRef} onMouseUp={handleTextSelection}>
          <article className="max-w-2xl mx-auto px-6 py-8 animate-fade-in-up">
            {/* Article Header */}
            <header className="mb-8">
              {article.imageUrl && (
                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-muted">
                  <img
                    src={article.imageUrl || "/placeholder.svg"}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight mb-3 text-balance leading-tight">{article.title}</h1>
              {article.author && <p className="text-lg text-muted-foreground">by {article.author}</p>}

              <div className="flex flex-wrap items-center gap-2 mt-4">
                {article.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="group px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-1 animate-fade-in-up hover:bg-secondary/80 transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(article.id, tag)}
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all duration-200"
                      title="Remove tag"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {showAddTag ? (
                  <div className="flex items-center gap-1 animate-scale-in">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="New tag..."
                      className="h-7 w-24 text-xs"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddTag}>
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowAddTag(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTag(true)}
                    className="px-2 py-1 border border-dashed border-muted-foreground/30 rounded-full text-xs text-muted-foreground hover:border-violet-500 hover:text-violet-400 hover:bg-violet-500/5 transition-all duration-200 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add tag
                  </button>
                )}
              </div>
            </header>

            {article.isFetchingContent ? (
              <div className="text-center py-16 px-4 animate-fade-in">
                <div className="h-20 w-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                  <Spinner className="h-10 w-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fetching article content...</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Preparing your distraction-free reading experience
                </p>
                {article.excerpt && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <p className="text-muted-foreground italic">{article.excerpt}</p>
                  </div>
                )}
              </div>
            ) : article.fetchError ? (
              <div className="text-center py-16 px-4 animate-fade-in">
                <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Couldn't fetch content</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  {article.fetchError}. You can try again or read the original article.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleRetryFetch} variant="outline" className="gap-2 bg-transparent btn-press">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button asChild className="btn-press bg-violet-600 hover:bg-violet-500">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      Read Original
                    </a>
                  </Button>
                </div>
              </div>
            ) : article.content ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none animate-fade-in-up animate-delay-100">
                {isHtmlContent ? (
                  <div
                    className="text-lg leading-relaxed selection:bg-violet-500/30
                      [&_p]:mb-4 [&_p]:text-foreground/90
                      [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
                      [&_h4]:text-lg [&_h4]:font-medium [&_h4]:mt-4 [&_h4]:mb-2
                      [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
                      [&_li]:text-foreground/90
                      [&_img]:rounded-lg [&_img]:my-6 [&_img]:max-w-full
                      [&_a]:text-violet-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-violet-300
                      [&_strong]:font-semibold [&_strong]:text-foreground
                      [&_em]:italic
                      [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                      [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: highlightedHtmlContent || article.content }}
                  />
                ) : (
                  <div className="text-lg leading-relaxed space-y-4 selection:bg-violet-500/30">{renderedContent}</div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 px-4 animate-fade-in">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No content available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  The article content couldn't be loaded. Try reading the original.
                </p>
                <Button asChild className="btn-press bg-violet-600 hover:bg-violet-500">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Read Original
                  </a>
                </Button>
              </div>
            )}
          </article>
        </div>

        {/* Highlights Sidebar */}
        {showHighlights && (
          <div className="w-80 border-l border-border bg-zinc-900/50 overflow-y-auto scrollbar-thin animate-slide-in-right">
            <div className="p-4 border-b border-border sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Highlighter className="h-4 w-4 text-violet-400" />
                  Highlights
                  <span className="text-xs text-muted-foreground">({article.highlights.length})</span>
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-zinc-800"
                  onClick={() => setShowHighlights(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {article.highlights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground animate-fade-in">
                  <Highlighter className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No highlights yet</p>
                  <p className="text-xs mt-1 opacity-70">Select text to create one</p>
                </div>
              ) : (
                article.highlights.map((highlight, index) => (
                  <div
                    key={highlight.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200 hover:shadow-md animate-fade-in-up group",
                      colorClasses[highlight.color],
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <p className="text-sm mb-2 line-clamp-3 text-foreground/90">"{highlight.text}"</p>

                    {editingNote === highlight.id ? (
                      <div className="mt-2 space-y-2 animate-fade-in">
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note..."
                          className="min-h-[60px] text-xs bg-zinc-800/50 border-zinc-600 resize-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs hover:bg-zinc-700"
                            onClick={() => setEditingNote(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs bg-violet-600 hover:bg-violet-500"
                            onClick={() => handleSaveNote(highlight.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : highlight.note ? (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{highlight.note}</span>
                        </p>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs hover:bg-zinc-700"
                          onClick={() => {
                            setEditingNote(highlight.id)
                            setNoteText(highlight.note || "")
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {highlight.note ? "Edit" : "Note"}
                        </Button>
                        {!hasFlashcard(highlight.id) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs hover:bg-zinc-700"
                            onClick={() => createFlashcardFromHighlight(article.id, highlight.id)}
                            title="Create flashcard"
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            Card
                          </Button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        onClick={() => deleteHighlight(article.id, highlight.id)}
                        title="Delete highlight"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
