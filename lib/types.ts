export type ArticleSource = "linkedin" | "substack" | "x" | "medium" | "youtube" | "other"

export interface Highlight {
  id: string
  text: string
  note?: string
  color: "yellow" | "green" | "blue" | "pink"
  createdAt: Date
  startOffset?: number
  endOffset?: number
}

export interface Flashcard {
  id: string
  articleId: string
  articleTitle: string
  highlightId: string
  front: string // The highlighted text
  back: string // The note or context
  lastReviewed?: Date
  nextReview?: Date
  difficulty: "easy" | "medium" | "hard"
  reviewCount: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  requirement: {
    type: "articles_read" | "streak_days" | "highlights_created" | "flashcards_reviewed" | "tags_used"
    count: number
  }
}

export interface ReadingGoal {
  id: string
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
  startDate: string
  endDate: string
}

export interface Article {
  id: string
  title: string
  url: string
  source: ArticleSource
  author?: string
  excerpt?: string
  imageUrl?: string
  content?: string
  contentImages?: string[]
  contentFetchedAt?: Date
  isFetchingContent?: boolean
  fetchError?: string
  highlights: Highlight[]
  tags: string[]
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
  readAt?: Date
}

export interface ReadingStreak {
  currentStreak: number
  longestStreak: number
  lastReadDate: string | null
  articlesReadToday: string[]
  dailyGoal: number
}

export interface UserStats {
  totalArticlesRead: number
  totalHighlights: number
  totalFlashcardsReviewed: number
  totalReadingTime: number // in minutes
  uniqueTagsUsed: string[]
}
