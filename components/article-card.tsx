"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useArticleStore } from "@/lib/store"
import type { Article, ArticleSource } from "@/lib/types"
import { Star, Globe, Highlighter, Archive, ArchiveRestore, Trash2, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ArticleCardProps {
  article: Article
  onClick: () => void
}

const SourceLogos: Record<ArticleSource, React.ReactNode> = {
  linkedin: (
    <svg className="h-3.5 w-3.5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  substack: (
    <svg className="h-3.5 w-3.5 text-[#FF6719]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  ),
  x: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  medium: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  ),
  other: <Globe className="h-3.5 w-3.5 text-muted-foreground" />,
}

const sourceLabels: Record<ArticleSource, string> = {
  linkedin: "LinkedIn",
  substack: "Substack",
  x: "X",
  medium: "Medium",
  other: "Other",
}

function safeDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const { selectedArticleId, toggleFavorite, toggleArchive, deleteArticle } = useArticleStore()
  const isSelected = selectedArticleId === article.id

  return (
    <article
      onClick={onClick}
      className={cn(
        "group px-4 py-3.5 cursor-pointer transition-all duration-150",
        isSelected ? "bg-accent border-l-2 border-l-foreground" : "hover:bg-accent/50 border-l-2 border-l-transparent",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              {SourceLogos[article.source]}
              <span className="uppercase tracking-wide">{sourceLabels[article.source]}</span>
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(safeDate(article.createdAt), { addSuffix: true })}
            </span>
            {article.highlights.length > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Highlighter className="h-3 w-3" />
                  {article.highlights.length}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-[14px] leading-snug mb-1 line-clamp-2 text-foreground">{article.title}</h3>

          {/* Author */}
          {article.author && <p className="text-xs text-muted-foreground mb-1.5">{article.author}</p>}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(article.id)
            }}
            className="p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                article.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground",
              )}
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-1.5 hover:bg-accent rounded-md transition-colors">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => toggleArchive(article.id)}>
                {article.isArchived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm("Delete this article?")) {
                    deleteArticle(article.id)
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  )
}
