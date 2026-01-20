"use client"

import { useArticleStore } from "@/lib/store"
import { Flame, Target, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export function StreakCard() {
  const { streak } = useArticleStore()

  const progress = Math.min((streak.articlesReadToday.length / streak.dailyGoal) * 100, 100)
  const goalReached = streak.articlesReadToday.length >= streak.dailyGoal

  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/30">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            goalReached
              ? "bg-orange-500 text-white"
              : "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
          )}
        >
          <Flame className={cn("h-4 w-4", goalReached && "animate-pulse")} />
        </div>
        <div>
          <p className="text-xs font-medium text-orange-900 dark:text-orange-100">Reading Streak</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-orange-700 dark:text-orange-300 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Today's goal
          </span>
          <span className="font-medium text-orange-900 dark:text-orange-100">
            {streak.articlesReadToday.length}/{streak.dailyGoal}
          </span>
        </div>
        <div className="h-2 bg-orange-200 dark:bg-orange-900/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              goalReached ? "bg-orange-500" : "bg-orange-400",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          Best: {streak.longestStreak} days
        </span>
        {goalReached && <span className="text-orange-600 dark:text-orange-400 font-medium">Goal reached!</span>}
      </div>
    </div>
  )
}
