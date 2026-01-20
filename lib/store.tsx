import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Article,
  Highlight,
  ArticleSource,
  ReadingStreak,
  Flashcard,
  Badge,
  ReadingGoal,
  UserStats,
} from "./types"

const sampleArticles: Article[] = [
  {
    id: "sample-1",
    title: "The Art of Slow Reading in a Fast World",
    url: "https://example.com/slow-reading",
    source: "substack",
    author: "Sarah Chen",
    excerpt:
      "In our age of infinite scrolling and constant notifications, the practice of slow reading has become a radical act of resistance...",
    imageUrl: "/person-reading-book-peacefully.jpg",
    content: `<p>In our age of infinite scrolling and constant notifications, the practice of slow reading has become a radical act of resistance. We consume more information than ever before, yet retain less of it. The solution isn't to read faster—it's to read slower.</p>
    
<h2>Why Slow Reading Matters</h2>
<p>Research shows that deep reading activates different neural pathways than skimming. When we slow down, we engage our prefrontal cortex more fully, leading to better comprehension and retention. The brain needs time to make connections between new information and existing knowledge.</p>

<p>Consider how you read a century ago versus today. Victorian readers would spend entire evenings with a single chapter. Today, we pride ourselves on "getting through" books as quickly as possible, as if reading were a chore to complete rather than an experience to savor.</p>

<h2>The Benefits of Deep Engagement</h2>
<p>Slow reading isn't just about retention—it's about transformation. When we truly engage with a text, we allow it to change us. We question our assumptions, consider new perspectives, and integrate ideas into our worldview.</p>

<p>The most successful leaders and thinkers throughout history have been voracious but deliberate readers. Warren Buffett famously spends 80% of his day reading. But he doesn't skim—he studies.</p>

<h2>Practical Tips for Slower Reading</h2>
<p>Start by creating a distraction-free environment. Put your phone in another room. Close unnecessary browser tabs. Set a timer for 25 minutes and commit to focused reading during that period.</p>

<p>Take notes as you read. Highlight passages that resonate with you. Write questions in the margins. The act of annotation forces you to engage more deeply with the material.</p>`,
    highlights: [
      {
        id: "h1",
        text: "the practice of slow reading has become a radical act of resistance",
        note: "Love this framing - reading as rebellion against the attention economy",
        color: "yellow",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "h2",
        text: "When we slow down, we engage our prefrontal cortex more fully, leading to better comprehension and retention",
        note: "Scientific backing for slow reading benefits",
        color: "green",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "h3",
        text: "Warren Buffett famously spends 80% of his day reading. But he doesn't skim—he studies.",
        color: "blue",
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
    tags: ["reading", "productivity", "mindfulness"],
    isFavorite: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 2),
    readAt: new Date(Date.now() - 86400000),
  },
  {
    id: "sample-2",
    title: "Building a Second Brain: The PARA Method",
    url: "https://example.com/second-brain",
    source: "medium",
    author: "Tiago Forte",
    excerpt:
      "Your mind is for having ideas, not holding them. Learn how to organize your digital life using the PARA method.",
    imageUrl: "/digital-brain-network-visualization.jpg",
    content: `<p>Your mind is for having ideas, not holding them. This simple insight is the foundation of building a "second brain"—a trusted system outside your head where you can store and organize everything you learn.</p>

<h2>The PARA Method</h2>
<p>PARA stands for Projects, Areas, Resources, and Archives. It's a universal system for organizing any type of digital information across any platform.</p>

<p><strong>Projects</strong> are short-term efforts with a deadline. They have a clear outcome and end date. Examples: launching a website, planning a trip, writing a report.</p>

<p><strong>Areas</strong> are ongoing responsibilities without an end date. They require continuous attention over time. Examples: health, finances, professional development.</p>

<p><strong>Resources</strong> are topics of ongoing interest. They're reference materials you might use in the future. Examples: design inspiration, industry trends, book notes.</p>

<p><strong>Archives</strong> are inactive items from the other categories. When a project is completed or an area is no longer relevant, it moves here.</p>

<h2>Why This Works</h2>
<p>The beauty of PARA is its actionability. Instead of organizing by topic (which leads to endless taxonomies), you organize by how actionable something is. This means the most relevant information is always at your fingertips.</p>

<p>Most people organize information by what it is. PARA organizes by when you'll use it. This shift in perspective changes everything.</p>`,
    highlights: [
      {
        id: "h4",
        text: "Your mind is for having ideas, not holding them",
        note: "This is the core philosophy - externalize knowledge to free up mental space",
        color: "yellow",
        createdAt: new Date(Date.now() - 172800000),
      },
      {
        id: "h5",
        text: "Instead of organizing by topic (which leads to endless taxonomies), you organize by how actionable something is",
        note: "Key insight: actionability > categorization",
        color: "pink",
        createdAt: new Date(Date.now() - 172800000),
      },
    ],
    tags: ["productivity", "note-taking", "organization"],
    isFavorite: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "sample-3",
    title: "The Psychology of Highlights: Why We Remember What We Mark",
    url: "https://example.com/psychology-highlights",
    source: "linkedin",
    author: "Dr. Emily Roberts",
    excerpt:
      "The simple act of highlighting text creates a cognitive anchor that dramatically improves recall. Here's the science behind it.",
    imageUrl: "/highlighter-pen-on-book-page.jpg",
    content: `<p>When you highlight a passage, you're not just marking text—you're creating a cognitive anchor. This simple act engages multiple memory systems and dramatically improves your ability to recall information later.</p>

<h2>The Generation Effect</h2>
<p>Psychologists call this the "generation effect." When we actively engage with material—by highlighting, annotating, or summarizing—we process it more deeply than when we passively read. The act of selection forces us to evaluate importance, which strengthens memory encoding.</p>

<p>But not all highlighting is equal. Mindless highlighting of entire paragraphs doesn't help. The key is selective highlighting: choosing only the most important phrases and adding your own notes.</p>

<h2>Color Coding and Memory</h2>
<p>Studies show that using different colors for different types of information can further enhance recall. Your brain naturally categorizes information, and color provides an additional retrieval cue.</p>

<p>Try using yellow for key concepts, green for evidence and data, blue for questions to explore further, and pink for personal insights and connections.</p>

<h2>The Spacing Effect</h2>
<p>Reviewing your highlights at spaced intervals dramatically improves long-term retention. This is why flashcard systems are so effective—they leverage the spacing effect to cement knowledge in long-term memory.</p>`,
    highlights: [
      {
        id: "h6",
        text: "The act of selection forces us to evaluate importance, which strengthens memory encoding",
        note: "This explains why active reading beats passive consumption",
        color: "green",
        createdAt: new Date(Date.now() - 259200000),
      },
    ],
    tags: ["psychology", "learning", "memory"],
    isFavorite: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 5),
    readAt: new Date(Date.now() - 259200000),
  },
]

const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first-read",
    name: "First Steps",
    description: "Read your first article",
    icon: "book-open",
    requirement: { type: "articles_read", count: 1 },
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Read 10 articles",
    icon: "library",
    requirement: { type: "articles_read", count: 10 },
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Read 50 articles",
    icon: "graduation-cap",
    requirement: { type: "articles_read", count: 50 },
  },
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Read 100 articles",
    icon: "brain",
    requirement: { type: "articles_read", count: 100 },
  },
  {
    id: "streak-starter",
    name: "Streak Starter",
    description: "Maintain a 3-day reading streak",
    icon: "flame",
    requirement: { type: "streak_days", count: 3 },
  },
  {
    id: "consistent-reader",
    name: "Consistent Reader",
    description: "Maintain a 7-day reading streak",
    icon: "calendar-check",
    requirement: { type: "streak_days", count: 7 },
  },
  {
    id: "habit-master",
    name: "Habit Master",
    description: "Maintain a 30-day reading streak",
    icon: "trophy",
    requirement: { type: "streak_days", count: 30 },
  },
  {
    id: "highlighter",
    name: "Highlighter",
    description: "Create 10 highlights",
    icon: "highlighter",
    requirement: { type: "highlights_created", count: 10 },
  },
  {
    id: "annotation-pro",
    name: "Annotation Pro",
    description: "Create 50 highlights",
    icon: "pen-tool",
    requirement: { type: "highlights_created", count: 50 },
  },
  {
    id: "flashcard-student",
    name: "Flashcard Student",
    description: "Review 25 flashcards",
    icon: "layers",
    requirement: { type: "flashcards_reviewed", count: 25 },
  },
  {
    id: "memory-master",
    name: "Memory Master",
    description: "Review 100 flashcards",
    icon: "sparkles",
    requirement: { type: "flashcards_reviewed", count: 100 },
  },
  {
    id: "organizer",
    name: "Organizer",
    description: "Use 5 different tags",
    icon: "tags",
    requirement: { type: "tags_used", count: 5 },
  },
]

interface ArticleStore {
  articles: Article[]
  selectedArticleId: string | null
  searchQuery: string
  filterSource: ArticleSource | "all"
  filterTag: string | "all"
  showArchived: boolean
  showFavorites: boolean

  streak: ReadingStreak

  flashcards: Flashcard[]
  badges: Badge[]
  goals: ReadingGoal[]
  stats: UserStats

  addArticle: (article: Omit<Article, "id" | "createdAt" | "highlights">) => string
  updateArticle: (id: string, updates: Partial<Article>) => void
  deleteArticle: (id: string) => void
  toggleFavorite: (id: string) => void
  toggleArchive: (id: string) => void

  addTag: (articleId: string, tag: string) => void
  removeTag: (articleId: string, tag: string) => void

  addHighlight: (articleId: string, highlight: Omit<Highlight, "id" | "createdAt">) => void
  updateHighlight: (articleId: string, highlightId: string, updates: Partial<Highlight>) => void
  deleteHighlight: (articleId: string, highlightId: string) => void

  setSelectedArticle: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setFilterSource: (source: ArticleSource | "all") => void
  setFilterTag: (tag: string | "all") => void
  setShowArchived: (show: boolean) => void
  setShowFavorites: (show: boolean) => void

  updateArticleContent: (id: string, content: string, images: string[]) => void
  setArticleFetching: (id: string, isFetching: boolean, error?: string) => void

  markArticleAsRead: (articleId: string) => void
  updateDailyGoal: (goal: number) => void

  createFlashcardFromHighlight: (articleId: string, highlightId: string) => void
  deleteFlashcard: (flashcardId: string) => void
  reviewFlashcard: (flashcardId: string, difficulty: "easy" | "medium" | "hard") => void

  setWeeklyGoal: (target: number) => void
  setMonthlyGoal: (target: number) => void

  checkBadges: () => void
}

const getTodayDate = () => new Date().toISOString().split("T")[0]

const getWeekStart = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.setDate(diff)).toISOString().split("T")[0]
}

const getWeekEnd = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? 0 : 7)
  return new Date(now.setDate(diff)).toISOString().split("T")[0]
}

const getMonthStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
}

const getMonthEnd = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
}

export const useArticleStore = create<ArticleStore>()(
  persist(
    (set, get) => ({
      articles: sampleArticles,
      selectedArticleId: null,
      searchQuery: "",
      filterSource: "all",
      filterTag: "all",
      showArchived: false,
      showFavorites: false,

      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
        articlesReadToday: [],
        dailyGoal: 5,
      },

      flashcards: [],
      badges: AVAILABLE_BADGES.map((b) => ({ ...b, unlockedAt: undefined })),
      goals: [
        {
          id: "weekly",
          type: "weekly",
          target: 10,
          current: 0,
          startDate: getWeekStart(),
          endDate: getWeekEnd(),
        },
        {
          id: "monthly",
          type: "monthly",
          target: 30,
          current: 0,
          startDate: getMonthStart(),
          endDate: getMonthEnd(),
        },
      ],
      stats: {
        totalArticlesRead: 0,
        totalHighlights: 0,
        totalFlashcardsReviewed: 0,
        totalReadingTime: 0,
        uniqueTagsUsed: [],
      },

      addArticle: (article) => {
        const id = Date.now().toString()
        set((state) => ({
          articles: [
            {
              ...article,
              id,
              createdAt: new Date(),
              highlights: [],
              isFetchingContent: true,
            },
            ...state.articles,
          ],
        }))
        return id
      },

      updateArticle: (id, updates) =>
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteArticle: (id) =>
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
          selectedArticleId: state.selectedArticleId === id ? null : state.selectedArticleId,
          // Also delete related flashcards
          flashcards: state.flashcards.filter((f) => f.articleId !== id),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)),
        })),

      toggleArchive: (id) =>
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? { ...a, isArchived: !a.isArchived } : a)),
          selectedArticleId: state.selectedArticleId === id ? null : state.selectedArticleId,
        })),

      addTag: (articleId, tag) => {
        set((state) => {
          const newUniqueTags = state.stats.uniqueTagsUsed.includes(tag)
            ? state.stats.uniqueTagsUsed
            : [...state.stats.uniqueTagsUsed, tag]
          return {
            articles: state.articles.map((a) =>
              a.id === articleId && !a.tags.includes(tag) ? { ...a, tags: [...a.tags, tag] } : a,
            ),
            stats: { ...state.stats, uniqueTagsUsed: newUniqueTags },
          }
        })
        get().checkBadges()
      },

      removeTag: (articleId, tag) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === articleId ? { ...a, tags: a.tags.filter((t) => t !== tag) } : a,
          ),
        })),

      addHighlight: (articleId, highlight) => {
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  highlights: [...a.highlights, { ...highlight, id: Date.now().toString(), createdAt: new Date() }],
                }
              : a,
          ),
          stats: { ...state.stats, totalHighlights: state.stats.totalHighlights + 1 },
        }))
        get().checkBadges()
      },

      updateHighlight: (articleId, highlightId, updates) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  highlights: a.highlights.map((h) => (h.id === highlightId ? { ...h, ...updates } : h)),
                }
              : a,
          ),
        })),

      deleteHighlight: (articleId, highlightId) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  highlights: a.highlights.filter((h) => h.id !== highlightId),
                }
              : a,
          ),
          flashcards: state.flashcards.filter((f) => f.highlightId !== highlightId),
        })),

      setSelectedArticle: (id) => set({ selectedArticleId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterSource: (source) => set({ filterSource: source }),
      setFilterTag: (tag) => set({ filterTag: tag }),
      setShowArchived: (show) => set({ showArchived: show, showFavorites: false }),
      setShowFavorites: (show) => set({ showFavorites: show, showArchived: false }),

      updateArticleContent: (id, content, images) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === id
              ? {
                  ...a,
                  content,
                  contentImages: images,
                  contentFetchedAt: new Date(),
                  isFetchingContent: false,
                  fetchError: undefined,
                }
              : a,
          ),
        })),

      setArticleFetching: (id, isFetching, error) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === id
              ? {
                  ...a,
                  isFetchingContent: isFetching,
                  fetchError: error,
                }
              : a,
          ),
        })),

      markArticleAsRead: (articleId) => {
        set((state) => {
          const today = getTodayDate()
          const { streak, goals } = state
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split("T")[0]

          let newArticlesReadToday = streak.articlesReadToday
          if (streak.lastReadDate !== today) {
            newArticlesReadToday = []
          }

          if (!newArticlesReadToday.includes(articleId)) {
            newArticlesReadToday = [...newArticlesReadToday, articleId]
          }

          let newCurrentStreak = streak.currentStreak
          if (streak.lastReadDate !== today) {
            if (streak.lastReadDate === yesterdayStr) {
              if (newArticlesReadToday.length >= streak.dailyGoal) {
                newCurrentStreak = streak.currentStreak + 1
              }
            } else if (streak.lastReadDate !== today) {
              newCurrentStreak = newArticlesReadToday.length >= streak.dailyGoal ? 1 : 0
            }
          } else if (newArticlesReadToday.length >= streak.dailyGoal && streak.currentStreak === 0) {
            newCurrentStreak = 1
          }

          const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak)

          // Update weekly/monthly goals
          const updatedGoals = goals.map((goal) => {
            const now = getTodayDate()
            if (goal.type === "weekly") {
              if (now < goal.startDate || now > goal.endDate) {
                return { ...goal, current: 1, startDate: getWeekStart(), endDate: getWeekEnd() }
              }
              return { ...goal, current: goal.current + 1 }
            }
            if (goal.type === "monthly") {
              if (now < goal.startDate || now > goal.endDate) {
                return { ...goal, current: 1, startDate: getMonthStart(), endDate: getMonthEnd() }
              }
              return { ...goal, current: goal.current + 1 }
            }
            return goal
          })

          return {
            articles: state.articles.map((a) => (a.id === articleId ? { ...a, readAt: new Date() } : a)),
            streak: {
              ...streak,
              currentStreak: newCurrentStreak,
              longestStreak: newLongestStreak,
              lastReadDate: today,
              articlesReadToday: newArticlesReadToday,
            },
            goals: updatedGoals,
            stats: { ...state.stats, totalArticlesRead: state.stats.totalArticlesRead + 1 },
          }
        })
        get().checkBadges()
      },

      updateDailyGoal: (goal) =>
        set((state) => ({
          streak: { ...state.streak, dailyGoal: goal },
        })),

      createFlashcardFromHighlight: (articleId, highlightId) => {
        const state = get()
        const article = state.articles.find((a) => a.id === articleId)
        const highlight = article?.highlights.find((h) => h.id === highlightId)

        if (!article || !highlight) return

        // Check if flashcard already exists
        const exists = state.flashcards.some((f) => f.highlightId === highlightId)
        if (exists) return

        const flashcard: Flashcard = {
          id: Date.now().toString(),
          articleId,
          articleTitle: article.title,
          highlightId,
          front: highlight.text,
          back: highlight.note || `From: ${article.title}`,
          difficulty: "medium",
          reviewCount: 0,
        }

        set((state) => ({
          flashcards: [...state.flashcards, flashcard],
        }))
      },

      deleteFlashcard: (flashcardId) =>
        set((state) => ({
          flashcards: state.flashcards.filter((f) => f.id !== flashcardId),
        })),

      reviewFlashcard: (flashcardId, difficulty) => {
        const now = new Date()
        let daysUntilNext = 1
        if (difficulty === "easy") daysUntilNext = 7
        else if (difficulty === "medium") daysUntilNext = 3
        else daysUntilNext = 1

        const nextReview = new Date(now)
        nextReview.setDate(nextReview.getDate() + daysUntilNext)

        set((state) => ({
          flashcards: state.flashcards.map((f) =>
            f.id === flashcardId
              ? {
                  ...f,
                  lastReviewed: now,
                  nextReview,
                  difficulty,
                  reviewCount: f.reviewCount + 1,
                }
              : f,
          ),
          stats: { ...state.stats, totalFlashcardsReviewed: state.stats.totalFlashcardsReviewed + 1 },
        }))
        get().checkBadges()
      },

      setWeeklyGoal: (target) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.type === "weekly" ? { ...g, target } : g)),
        })),

      setMonthlyGoal: (target) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.type === "monthly" ? { ...g, target } : g)),
        })),

      checkBadges: () => {
        const state = get()
        const { stats, streak, badges } = state

        const updatedBadges = badges.map((badge) => {
          if (badge.unlockedAt) return badge

          let shouldUnlock = false
          switch (badge.requirement.type) {
            case "articles_read":
              shouldUnlock = stats.totalArticlesRead >= badge.requirement.count
              break
            case "streak_days":
              shouldUnlock =
                streak.currentStreak >= badge.requirement.count || streak.longestStreak >= badge.requirement.count
              break
            case "highlights_created":
              shouldUnlock = stats.totalHighlights >= badge.requirement.count
              break
            case "flashcards_reviewed":
              shouldUnlock = stats.totalFlashcardsReviewed >= badge.requirement.count
              break
            case "tags_used":
              shouldUnlock = stats.uniqueTagsUsed.length >= badge.requirement.count
              break
          }

          if (shouldUnlock) {
            return { ...badge, unlockedAt: new Date() }
          }
          return badge
        })

        set({ badges: updatedBadges })
      },
    }),
    {
      name: "article-storage",
    },
  ),
)
