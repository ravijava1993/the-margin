"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useArticleStore } from "@/lib/store"
import {
  Star,
  Archive,
  Hash,
  Plus,
  Globe,
  Inbox,
  Layers,
  Trophy,
  Flame,
  ChevronLeft,
  ChevronRight,
  Download,
  Highlighter,
} from "lucide-react"
import Image from "next/image"
import type { ArticleSource } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserMenu } from "@/components/user-menu"

interface SidebarProps {
  onAddArticle: () => void
  onOpenFlashcards: () => void
  onOpenBadges: () => void
  onImportClips: () => void
  onOpenAllHighlights: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isDemoMode?: boolean
}

const SourceLogos: Record<ArticleSource, React.ReactNode> = {
  linkedin: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  substack: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  ),
  x: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  medium: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  ),
  youtube: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  other: <Globe className="h-4 w-4" />,
}

const sourceLabels: Record<ArticleSource, string> = {
  linkedin: "LinkedIn",
  substack: "Substack",
  x: "X",
  medium: "Medium",
  youtube: "YouTube",
  other: "Other",
}

export function Sidebar({
  onAddArticle,
  onOpenFlashcards,
  onOpenBadges,
  onImportClips,
  onOpenAllHighlights,
  isCollapsed,
  onToggleCollapse,
  isDemoMode,
}: SidebarProps) {
  const {
    articles,
    filterSource,
    filterTag,
    showArchived,
    showFavorites,
    setFilterSource,
    setFilterTag,
    setShowArchived,
    setShowFavorites,
    flashcards,
    badges,
    streak,
  } = useArticleStore()

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)))
  const sources: ArticleSource[] = ["linkedin", "substack", "x", "medium", "youtube", "other"]

  const activeArticles = articles.filter((a) => !a.isArchived)
  const favoriteCount = articles.filter((a) => a.isFavorite && !a.isArchived).length
  const archivedCount = articles.filter((a) => a.isArchived).length
  const unlockedBadgesCount = badges.filter((b) => b.unlockedAt).length
  const totalHighlightsCount = articles.reduce((acc, a) => acc + a.highlights.length, 0)

  const getSourceCount = (source: ArticleSource) => articles.filter((a) => a.source === source && !a.isArchived).length
  const getTagCount = (tag: string) => articles.filter((a) => a.tags.includes(tag) && !a.isArchived).length

  const dailyProgress = Math.min((streak.articlesReadToday.length / streak.dailyGoal) * 100, 100)

  const NavItem = ({
    children,
    label,
    onClick,
    isActive,
    count,
    icon,
  }: {
    children?: React.ReactNode
    label: string
    onClick: () => void
    isActive: boolean
    count?: number
    icon: React.ReactNode
  }) => {
    const button = (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200",
          isActive
            ? "bg-accent text-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          isCollapsed && "justify-center px-2",
        )}
      >
        {icon}
        {!isCollapsed && (
          <>
            {label}
            {count !== undefined && <span className="ml-auto text-xs text-muted-foreground">{count}</span>}
          </>
        )}
      </button>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {label}
            {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "border-r border-border bg-sidebar flex flex-col h-full transition-all duration-300 ease-out",
          isCollapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        {/* Logo */}
        <div className={cn("px-4 py-4 border-b border-border", isCollapsed && "px-3")}>
          <div className={cn("flex items-center justify-between", isCollapsed && "justify-center")}>
            <div className={cn("flex items-center gap-2.5", isCollapsed && "")}>
              <Image src="/icon.png" alt="The Margin" width={32} height={32} className="rounded-lg" />
              {!isCollapsed && <span className="font-semibold text-[15px] tracking-tight">The Margin</span>}
            </div>
            {!isCollapsed && <UserMenu isDemoMode={isDemoMode} />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={cn("px-3 py-3 space-y-2", isCollapsed && "px-2")}>
          {/* Add Article Button */}
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onAddArticle}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Add Article</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onAddArticle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Article
            </button>
          )}

          {/* Import Clips Button */}
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onImportClips}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                >
                  <Download className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Import Clips</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onImportClips}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              Import Clips
            </button>
          )}
        </div>

        {/* Streak & Stats - Compact */}
        {!isCollapsed ? (
          <div className="px-3 pb-3 space-y-2">
            {/* Streak Progress */}
            <div className="p-3 rounded-lg bg-accent/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame
                    className={cn("h-4 w-4", streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")}
                  />
                  <span className="text-sm font-medium">{streak.currentStreak} day streak</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {streak.articlesReadToday.length}/{streak.dailyGoal}
                </span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    dailyProgress >= 100 ? "bg-green-500" : "bg-orange-500",
                  )}
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              {/* Highlights Button */}
              <button
                onClick={onOpenAllHighlights}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors"
              >
                <Highlighter className="h-4 w-4 text-violet-500" />
                <span className="text-[10px] font-medium">{totalHighlightsCount}</span>
              </button>
              <button
                onClick={onOpenFlashcards}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors"
              >
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-medium">{flashcards.length}</span>
              </button>
              <button
                onClick={onOpenBadges}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors"
              >
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-[10px] font-medium">
                  {unlockedBadgesCount}/{badges.length}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="px-2 pb-3 space-y-2">
            {/* Collapsed streak indicator */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-accent/50 border border-border flex items-center justify-center">
                  <Flame
                    className={cn("h-4 w-4", streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {streak.currentStreak} day streak ({streak.articlesReadToday.length}/{streak.dailyGoal} today)
              </TooltipContent>
            </Tooltip>

            {/* Highlights Button in collapsed state */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenAllHighlights}
                  className="w-full p-2 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <Highlighter className="h-4 w-4 text-violet-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{totalHighlightsCount} Highlights</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenFlashcards}
                  className="w-full p-2 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{flashcards.length} Flashcards</TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenBadges}
                  className="w-full p-2 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {unlockedBadgesCount}/{badges.length} Badges
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <UserMenu isDemoMode={isDemoMode} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Account</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-5 scrollbar-thin">
          {/* Library */}
          <div>
            {!isCollapsed && (
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                Library
              </h3>
            )}
            <ul className="space-y-0.5">
              <li>
                <NavItem
                  label="All Articles"
                  icon={<Inbox className="h-4 w-4" />}
                  onClick={() => {
                    setFilterSource("all")
                    setFilterTag("all")
                    setShowArchived(false)
                  }}
                  isActive={filterSource === "all" && filterTag === "all" && !showArchived && !showFavorites}
                  count={activeArticles.length}
                />
              </li>
              <li>
                <NavItem
                  label="Favorites"
                  icon={<Star className="h-4 w-4" />}
                  onClick={() => {
                    setShowFavorites(true)
                    setFilterSource("all")
                    setFilterTag("all")
                  }}
                  isActive={showFavorites}
                  count={favoriteCount}
                />
              </li>
              <li>
                <NavItem
                  label="Archived"
                  icon={<Archive className="h-4 w-4" />}
                  onClick={() => {
                    setShowArchived(true)
                    setFilterSource("all")
                    setFilterTag("all")
                  }}
                  isActive={showArchived}
                  count={archivedCount}
                />
              </li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            {!isCollapsed && (
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                Sources
              </h3>
            )}
            <ul className="space-y-0.5">
              {sources.map((source) => {
                const count = getSourceCount(source)
                if (count === 0) return null
                return (
                  <li key={source}>
                    <NavItem
                      label={sourceLabels[source]}
                      icon={SourceLogos[source]}
                      onClick={() => {
                        setFilterSource(source)
                        setFilterTag("all")
                        setShowArchived(false)
                        setShowFavorites(false)
                      }}
                      isActive={filterSource === source && !showArchived && !showFavorites}
                      count={count}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Tags */}
          {allTags.length > 0 && !isCollapsed && (
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                Tags
              </h3>
              <ul className="space-y-0.5">
                {allTags.slice(0, 6).map((tag) => (
                  <li key={tag}>
                    <NavItem
                      label={tag}
                      icon={<Hash className="h-4 w-4" />}
                      onClick={() => {
                        setFilterTag(tag)
                        setFilterSource("all")
                        setShowArchived(false)
                        setShowFavorites(false)
                      }}
                      isActive={filterTag === tag && !showArchived && !showFavorites}
                      count={getTagCount(tag)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {!isCollapsed && <span className="text-xs">Collapse</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
