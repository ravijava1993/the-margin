"use client"

import { useState, useMemo } from "react"
import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Trash2, BookOpen, Check, X, Minus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

function safeDate(date: Date | string | undefined): Date | undefined {
  if (!date) return undefined
  return typeof date === "string" ? new Date(date) : date
}

export function Flashcards({ onClose }: { onClose: () => void }) {
  const { flashcards, reviewFlashcard, deleteFlashcard, setSelectedArticle } = useArticleStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAll, setShowAll] = useState(true)

  const dueFlashcards = useMemo(() => {
    if (showAll) return flashcards
    const now = new Date()
    return flashcards.filter((f) => {
      const nextReview = safeDate(f.nextReview)
      return !nextReview || nextReview <= now
    })
  }, [flashcards, showAll])

  const currentCard = dueFlashcards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => Math.min(prev + 1, dueFlashcards.length - 1))
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleReview = (difficulty: "easy" | "medium" | "hard") => {
    if (!currentCard) return
    reviewFlashcard(currentCard.id, difficulty)
    setIsFlipped(false)
    if (currentIndex < dueFlashcards.length - 1) {
      handleNext()
    }
  }

  if (flashcards.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Flashcards Yet</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Create flashcards from your highlights to review and remember key insights.
          </p>
          <Button onClick={onClose} className="h-10">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (dueFlashcards.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">All Caught Up!</h2>
          <p className="text-muted-foreground text-sm mb-6">You've reviewed all due flashcards.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowAll(true)}>
              Review All ({flashcards.length})
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    )
  }

  const lastReviewedDate = safeDate(currentCard?.lastReviewed)

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
              <Layers className="h-4 w-4" />
              Flashcards
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} of {dueFlashcards.length}
            </p>
          </div>
        </div>
        <Button
          variant={showAll ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            setShowAll(!showAll)
            setCurrentIndex(0)
          }}
          className="h-8 text-xs"
        >
          {showAll ? "All Cards" : "Due Only"}
        </Button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Card */}
          <div
            className="relative w-full aspect-[3/2] cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className="absolute inset-0 transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-2xl border border-border bg-card p-8 flex flex-col"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-lg md:text-xl text-center font-medium leading-relaxed">"{currentCard?.front}"</p>
                </div>
                <p className="text-center text-xs text-muted-foreground">Click to reveal</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-2xl border border-border bg-accent p-8 flex flex-col"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <p className="text-xs text-muted-foreground">Your Note</p>
                  <p className="text-lg md:text-xl font-medium text-center">{currentCard?.back}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedArticle(currentCard?.articleId || null)
                      onClose()
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-4"
                  >
                    <BookOpen className="h-3 w-3" />
                    {currentCard?.articleTitle}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Review buttons */}
          {isFlipped && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10 bg-transparent"
                onClick={() => handleReview("hard")}
              >
                <X className="h-3.5 w-3.5" />
                Hard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 bg-transparent"
                onClick={() => handleReview("medium")}
              >
                <Minus className="h-3.5 w-3.5" />
                Medium
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-green-500/30 text-green-500 hover:bg-green-500/10 bg-transparent"
                onClick={() => handleReview("easy")}
              >
                <Check className="h-3.5 w-3.5" />
                Easy
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsFlipped(false)}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (currentCard) {
                    deleteFlashcard(currentCard.id)
                    if (currentIndex >= dueFlashcards.length - 1) {
                      setCurrentIndex(Math.max(0, currentIndex - 1))
                    }
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={handleNext} disabled={currentIndex === dueFlashcards.length - 1}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {lastReviewedDate && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Last reviewed {formatDistanceToNow(lastReviewedDate, { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-foreground transition-all"
          style={{ width: `${((currentIndex + 1) / dueFlashcards.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
