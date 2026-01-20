"use client"

import { useState } from "react"
import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Target, TrendingUp, Calendar, CalendarDays, Settings2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function GoalsCard() {
  const { goals, streak, setWeeklyGoal, setMonthlyGoal, updateDailyGoal } = useArticleStore()
  const [isEditing, setIsEditing] = useState(false)
  const [dailyGoalInput, setDailyGoalInput] = useState(streak.dailyGoal.toString())
  const [weeklyGoalInput, setWeeklyGoalInput] = useState(
    goals.find((g) => g.type === "weekly")?.target.toString() || "10",
  )
  const [monthlyGoalInput, setMonthlyGoalInput] = useState(
    goals.find((g) => g.type === "monthly")?.target.toString() || "30",
  )

  const weeklyGoal = goals.find((g) => g.type === "weekly")
  const monthlyGoal = goals.find((g) => g.type === "monthly")

  const handleSave = () => {
    updateDailyGoal(Number.parseInt(dailyGoalInput) || 5)
    setWeeklyGoal(Number.parseInt(weeklyGoalInput) || 10)
    setMonthlyGoal(Number.parseInt(monthlyGoalInput) || 30)
    setIsEditing(false)
  }

  const dailyProgress = Math.min((streak.articlesReadToday.length / streak.dailyGoal) * 100, 100)
  const weeklyProgress = weeklyGoal ? Math.min((weeklyGoal.current / weeklyGoal.target) * 100, 100) : 0
  const monthlyProgress = monthlyGoal ? Math.min((monthlyGoal.current / monthlyGoal.target) * 100, 100) : 0

  return (
    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Reading Goals
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Daily Goal */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Daily
            </span>
            {isEditing ? (
              <Input
                type="number"
                value={dailyGoalInput}
                onChange={(e) => setDailyGoalInput(e.target.value)}
                className="h-6 w-16 text-xs text-right"
                min={1}
              />
            ) : (
              <span className={cn("font-medium", dailyProgress >= 100 && "text-green-500")}>
                {streak.articlesReadToday.length}/{streak.dailyGoal}
              </span>
            )}
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all rounded-full", dailyProgress >= 100 ? "bg-green-500" : "bg-primary")}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>

        {/* Weekly Goal */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Weekly
            </span>
            {isEditing ? (
              <Input
                type="number"
                value={weeklyGoalInput}
                onChange={(e) => setWeeklyGoalInput(e.target.value)}
                className="h-6 w-16 text-xs text-right"
                min={1}
              />
            ) : (
              <span className={cn("font-medium", weeklyProgress >= 100 && "text-green-500")}>
                {weeklyGoal?.current || 0}/{weeklyGoal?.target || 10}
              </span>
            )}
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all rounded-full",
                weeklyProgress >= 100 ? "bg-green-500" : "bg-blue-500",
              )}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>

        {/* Monthly Goal */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Monthly
            </span>
            {isEditing ? (
              <Input
                type="number"
                value={monthlyGoalInput}
                onChange={(e) => setMonthlyGoalInput(e.target.value)}
                className="h-6 w-16 text-xs text-right"
                min={1}
              />
            ) : (
              <span className={cn("font-medium", monthlyProgress >= 100 && "text-green-500")}>
                {monthlyGoal?.current || 0}/{monthlyGoal?.target || 30}
              </span>
            )}
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all rounded-full",
                monthlyProgress >= 100 ? "bg-green-500" : "bg-purple-500",
              )}
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
