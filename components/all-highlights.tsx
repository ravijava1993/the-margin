"use client"

import { useState, useMemo } from "react"
import { useArticleStore } from "@/lib/store"
import { ChevronLeft, Search, Highlighter, ExternalLink, Layers, Trash2, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { SourceLogo } from "@/components/source-logo"
import { Button } from "@/components/ui/button"

interface AllHighlightsProps {
  onClose: () => void
  onSelectArticle: (articleId: string) => void
}

const highlightColors = {
  yellow: "bg-yellow-500/20 border-yellow-500/40",
  green: "bg-green-500/20 border-green-500/40",
  blue: "bg-blue-500/20 border-blue-500/40",
  pink: "bg-pink-500/20 border-pink-500/40",
}

const colorDots = {
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  pink: "bg-pink-500",
}

export function AllHighlights({ onClose, onSelectArticle }: AllHighlightsProps) {
  const { articles, deleteHighlight, createFlashcardFromHighlight, flashcards } = useArticleStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterColor, setFilterColor] = useState<"all" | "yellow" | "green" | "blue" | "pink">("all")
  const [sortBy, setSortBy] = useState<"recent" | "article">("recent")

  // Collect all highlights with article info
  const allHighlights = useMemo(() => {
    const highlights: Array<{
      highlight: (typeof articles)[0]["highlights"][0]
      article: (typeof articles)[0]
    }> = []

    articles.forEach((article) => {
      article.highlights.forEach((highlight) => {
        highlights.push({ highlight, article })
      })
    })

    return highlights
  }, [articles])

  // Filter and sort
  const filteredHighlights = useMemo(() => {
    let result = allHighlights

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        ({ highlight, article }) =>
          highlight.text.toLowerCase().includes(query) ||
          (highlight.note && highlight.note.toLowerCase().includes(query)) ||
          article.title.toLowerCase().includes(query),
      )
    }

    // Color filter
    if (filterColor !== "all") {
      result = result.filter(({ highlight }) => highlight.color === filterColor)
    }

    // Sort
    if (sortBy === "recent") {
      result = [...result].sort((a, b) => {
        const dateA = new Date(a.highlight.createdAt).getTime()
        const dateB = new Date(b.highlight.createdAt).getTime()
        return dateB - dateA
      })
    } else {
      result = [...result].sort((a, b) => a.article.title.localeCompare(b.article.title))
    }

    return result
  }, [allHighlights, searchQuery, filterColor, sortBy])

  // Group by article if sorted by article
  const groupedHighlights = useMemo(() => {
    if (sortBy !== "article") return null

    const groups: Record<string, typeof filteredHighlights> = {}
    filteredHighlights.forEach((item) => {
      if (!groups[item.article.id]) {
        groups[item.article.id] = []
      }
      groups[item.article.id].push(item)
    })
    return groups
  }, [filteredHighlights, sortBy])

  const safeDate = (date: Date | string | undefined) => {
    if (!date) return new Date()
    return typeof date === "string" ? new Date(date) : date
  }

  const hasFlashcard = (highlightId: string) => {
    return flashcards.some((f) => f.highlightId === highlightId)
  }

  const handleCreateFlashcard = (articleId: string, highlightId: string) => {
    createFlashcardFromHighlight(articleId, highlightId)
  }

  const handleDelete = (articleId: string, highlightId: string) => {
    if (confirm("Are you sure you want to delete this highlight?")) {
      deleteHighlight(articleId, highlightId)
    }
  }

  const handleGoToArticle = (articleId: string) => {
    onSelectArticle(articleId)
    onClose()
  }

  if (allHighlights.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
            <Highlighter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Highlights Yet</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Start highlighting text in articles to collect your favorite passages and insights.
          </p>
          <Button onClick={onClose} className="h-10">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Highlighter className="h-4 w-4 text-violet-500" />
              All Highlights
            </h2>
            <p className="text-xs text-muted-foreground">
              {allHighlights.length} highlight{allHighlights.length !== 1 ? "s" : ""} across{" "}
              {articles.filter((a) => a.highlights.length > 0).length} articles
            </p>
          </div>
        </div>

        {/* Sort toggle */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "article")}
          className="px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          <option value="recent">Most Recent</option>
          <option value="article">By Article</option>
        </select>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search highlights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Color filter */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterColor("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filterColor === "all"
                ? "bg-foreground text-background"
                : "bg-accent hover:bg-accent/80 text-muted-foreground",
            )}
          >
            All
          </button>
          {(["yellow", "green", "blue", "pink"] as const).map((color) => (
            <button
              key={color}
              onClick={() => setFilterColor(color)}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                filterColor === color
                  ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                  : "hover:scale-110",
              )}
            >
              <div className={cn("w-4 h-4 rounded-full", colorDots[color])} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {filteredHighlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-accent/50 mb-4">
              <Highlighter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No highlights found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Try adjusting your filters or search query</p>
          </div>
        ) : sortBy === "article" && groupedHighlights ? (
          // Grouped view
          <div className="max-w-3xl mx-auto space-y-8">
            {Object.entries(groupedHighlights).map(([articleId, items]) => (
              <div key={articleId} className="space-y-3">
                {/* Article header */}
                <button onClick={() => handleGoToArticle(articleId)} className="flex items-center gap-2 group">
                  <SourceLogo source={items[0].article.source} className="h-4 w-4" />
                  <span className="text-sm font-medium group-hover:text-violet-400 transition-colors">
                    {items[0].article.title}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Highlights */}
                <div className="space-y-2 pl-6 border-l-2 border-border">
                  {items.map(({ highlight, article }) => (
                    <HighlightCard
                      key={highlight.id}
                      highlight={highlight}
                      article={article}
                      onGoToArticle={handleGoToArticle}
                      onCreateFlashcard={handleCreateFlashcard}
                      onDelete={handleDelete}
                      hasFlashcard={hasFlashcard(highlight.id)}
                      safeDate={safeDate}
                      showArticle={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat view
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredHighlights.map(({ highlight, article }) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                article={article}
                onGoToArticle={handleGoToArticle}
                onCreateFlashcard={handleCreateFlashcard}
                onDelete={handleDelete}
                hasFlashcard={hasFlashcard(highlight.id)}
                safeDate={safeDate}
                showArticle={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-violet-500 transition-all"
          style={{ width: `${(filteredHighlights.length / Math.max(allHighlights.length, 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

// Highlight Card Component
function HighlightCard({
  highlight,
  article,
  onGoToArticle,
  onCreateFlashcard,
  onDelete,
  hasFlashcard,
  safeDate,
  showArticle,
}: {
  highlight: {
    id: string
    text: string
    note?: string
    color: "yellow" | "green" | "blue" | "pink"
    createdAt: Date
  }
  article: {
    id: string
    title: string
    source: "linkedin" | "substack" | "x" | "medium" | "other"
  }
  onGoToArticle: (id: string) => void
  onCreateFlashcard: (articleId: string, highlightId: string) => void
  onDelete: (articleId: string, highlightId: string) => void
  hasFlashcard: boolean
  safeDate: (date: Date | string | undefined) => Date
  showArticle: boolean
}) {
  return (
    <div className={cn("p-4 rounded-lg border transition-all hover:shadow-md group", highlightColors[highlight.color])}>
      {/* Article info (if showing) */}
      {showArticle && (
        <button
          onClick={() => onGoToArticle(article.id)}
          className="flex items-center gap-2 mb-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <SourceLogo source={article.source} className="h-3.5 w-3.5" />
          <span className="truncate max-w-[300px]">{article.title}</span>
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </button>
      )}

      {/* Highlight text */}
      <p className="text-sm leading-relaxed">{highlight.text}</p>

      {/* Note */}
      {highlight.note && (
        <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
          <StickyNote className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{highlight.note}</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(safeDate(highlight.createdAt), { addSuffix: true })}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!hasFlashcard && (
            <button
              onClick={() => onCreateFlashcard(article.id, highlight.id)}
              className="p-1.5 rounded-md hover:bg-background/50 transition-colors"
              title="Create flashcard"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
          )}
          {hasFlashcard && (
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-medium">
              Flashcard
            </span>
          )}
          <button
            onClick={() => onDelete(article.id, highlight.id)}
            className="p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Delete highlight"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
