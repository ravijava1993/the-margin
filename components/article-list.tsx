"use client"

import { useArticleStore } from "@/lib/store"
import { ArticleCard } from "./article-card"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DailyPicks } from "./daily-picks"

type SearchField = "all" | "title" | "content" | "author" | "highlights" | "notes" | "source" | "tags"

const searchFieldLabels: Record<SearchField, string> = {
  all: "All",
  title: "Title",
  content: "Content",
  author: "Author",
  highlights: "Highlights",
  notes: "Notes",
  source: "Source",
  tags: "Tags",
}

export function ArticleList() {
  const {
    articles,
    searchQuery,
    filterSource,
    filterTag,
    showArchived,
    showFavorites,
    setSearchQuery,
    setSelectedArticle,
  } = useArticleStore()

  const [searchField, setSearchField] = useState<SearchField>("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredArticles = articles.filter((article) => {
    if (showArchived) return article.isArchived
    if (article.isArchived) return false
    if (showFavorites && !article.isFavorite) return false

    const query = searchQuery.toLowerCase()
    let matchesSearch = searchQuery === ""

    if (!matchesSearch) {
      const searchInTitle = () => article.title.toLowerCase().includes(query)
      const searchInContent = () => article.content?.toLowerCase().includes(query) || false
      const searchInAuthor = () => article.author?.toLowerCase().includes(query) || false
      const searchInExcerpt = () => article.excerpt?.toLowerCase().includes(query) || false
      const searchInHighlights = () => article.highlights.some((h) => h.text.toLowerCase().includes(query))
      const searchInNotes = () => article.highlights.some((h) => h.note?.toLowerCase().includes(query))
      const searchInSource = () => article.source.toLowerCase().includes(query)
      const searchInTags = () => article.tags.some((t) => t.toLowerCase().includes(query))

      switch (searchField) {
        case "title":
          matchesSearch = searchInTitle()
          break
        case "content":
          matchesSearch = searchInContent() || searchInExcerpt()
          break
        case "author":
          matchesSearch = searchInAuthor()
          break
        case "highlights":
          matchesSearch = searchInHighlights()
          break
        case "notes":
          matchesSearch = searchInNotes()
          break
        case "source":
          matchesSearch = searchInSource()
          break
        case "tags":
          matchesSearch = searchInTags()
          break
        case "all":
        default:
          matchesSearch =
            searchInTitle() ||
            searchInContent() ||
            searchInAuthor() ||
            searchInExcerpt() ||
            searchInHighlights() ||
            searchInNotes() ||
            searchInSource() ||
            searchInTags()
      }
    }

    const matchesSource = filterSource === "all" || article.source === filterSource
    const matchesTag = filterTag === "all" || article.tags.includes(filterTag)

    return matchesSearch && matchesSource && matchesTag
  })

  const getTitle = () => {
    if (showArchived) return "Archived"
    if (showFavorites) return "Favorites"
    if (filterSource !== "all") return filterSource.charAt(0).toUpperCase() + filterSource.slice(1)
    if (filterTag !== "all") return filterTag
    return "All Articles"
  }

  const showDailyPicks =
    !showArchived && !showFavorites && filterSource === "all" && filterTag === "all" && !searchQuery

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-border bg-card">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{getTitle()}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9 bg-background border-border focus-visible:ring-1 focus-visible:ring-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 w-9 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <div className="flex flex-wrap gap-1">
              {(Object.keys(searchFieldLabels) as SearchField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => setSearchField(field)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    searchField === field
                      ? "bg-foreground text-background font-medium"
                      : "bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {searchFieldLabels[field]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {showDailyPicks && <DailyPicks />}

        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No articles found</h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              {searchQuery ? "Try a different search term" : "Add your first article to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
