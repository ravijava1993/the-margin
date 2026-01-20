"use client"

import type React from "react"

import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  X,
  BookOpen,
  Library,
  GraduationCap,
  Brain,
  Flame,
  CalendarCheck,
  Trophy,
  Highlighter,
  PenTool,
  Layers,
  Sparkles,
  Tags,
  Lock,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const iconMap: Record<string, React.ReactNode> = {
  "book-open": <BookOpen className="h-5 w-5" />,
  library: <Library className="h-5 w-5" />,
  "graduation-cap": <GraduationCap className="h-5 w-5" />,
  brain: <Brain className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  "calendar-check": <CalendarCheck className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
  highlighter: <Highlighter className="h-5 w-5" />,
  "pen-tool": <PenTool className="h-5 w-5" />,
  layers: <Layers className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  tags: <Tags className="h-5 w-5" />,
}

function safeDate(date: Date | string | undefined): Date | undefined {
  if (!date) return undefined
  return typeof date === "string" ? new Date(date) : date
}

export function Badges({ onClose }: { onClose: () => void }) {
  const { badges, stats, streak } = useArticleStore()

  const unlockedBadges = badges.filter((b) => b.unlockedAt)
  const lockedBadges = badges.filter((b) => !b.unlockedAt)

  const getProgress = (badge: (typeof badges)[0]) => {
    const { type, count } = badge.requirement
    let current = 0

    switch (type) {
      case "articles_read":
        current = stats.totalArticlesRead
        break
      case "streak_days":
        current = Math.max(streak.currentStreak, streak.longestStreak)
        break
      case "highlights_created":
        current = stats.totalHighlights
        break
      case "flashcards_reviewed":
        current = stats.totalFlashcardsReviewed
        break
      case "tags_used":
        current = stats.uniqueTagsUsed.length
        break
    }

    return Math.min((current / count) * 100, 100)
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Achievements
          </h2>
          <p className="text-xs text-muted-foreground">
            {unlockedBadges.length} of {badges.length} unlocked
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { value: stats.totalArticlesRead, label: "Articles", color: "text-foreground" },
              { value: streak.longestStreak, label: "Best Streak", color: "text-orange-500" },
              { value: stats.totalHighlights, label: "Highlights", color: "text-yellow-500" },
              { value: stats.totalFlashcardsReviewed, label: "Reviews", color: "text-green-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Unlocked */}
          {unlockedBadges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Unlocked
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {unlockedBadges.map((badge) => {
                  const unlockedDate = safeDate(badge.unlockedAt)
                  return (
                    <div
                      key={badge.id}
                      className="bg-gradient-to-b from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-xl p-4 text-center"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-3 text-white">
                        {iconMap[badge.icon] || <Trophy className="h-5 w-5" />}
                      </div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
                      {unlockedDate && (
                        <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-2">
                          {formatDistanceToNow(unlockedDate, { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Locked */}
          {lockedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                Locked
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lockedBadges.map((badge) => {
                  const progress = getProgress(badge)
                  return (
                    <div key={badge.id} className="bg-card border border-border rounded-xl p-4 text-center">
                      <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                        {iconMap[badge.icon] || <Trophy className="h-5 w-5" />}
                      </div>
                      <h4 className="font-medium text-sm text-muted-foreground">{badge.name}</h4>
                      <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-2">{badge.description}</p>
                      <div className="mt-3">
                        <div className="h-1 bg-accent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-muted-foreground/30 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">{Math.round(progress)}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
