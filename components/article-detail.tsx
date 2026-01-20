"use client"

import type React from "react"

import { useState } from "react"
import { useArticleStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ExternalLink,
  Star,
  Archive,
  Trash2,
  X,
  Plus,
  Highlighter,
  Linkedin,
  FileText,
  Twitter,
  BookOpen,
  Globe,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ArticleSource, Highlight } from "@/lib/types"
import { cn } from "@/lib/utils"

const sourceIcons: Record<ArticleSource, React.ReactNode> = {
  linkedin: <Linkedin className="h-4 w-4" />,
  substack: <FileText className="h-4 w-4" />,
  x: <Twitter className="h-4 w-4" />,
  medium: <BookOpen className="h-4 w-4" />,
  other: <Globe className="h-4 w-4" />,
}

const highlightColors: Highlight["color"][] = ["yellow", "green", "blue", "pink"]

const colorClasses: Record<Highlight["color"], string> = {
  yellow: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700",
  green: "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
  blue: "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
  pink: "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
}

export function ArticleDetail() {
  const {
    articles,
    selectedArticleId,
    setSelectedArticle,
    toggleFavorite,
    toggleArchive,
    deleteArticle,
    addHighlight,
    updateHighlight,
    deleteHighlight,
  } = useArticleStore()

  const [newHighlight, setNewHighlight] = useState("")
  const [newHighlightNote, setNewHighlightNote] = useState("")
  const [newHighlightColor, setNewHighlightColor] = useState<Highlight["color"]>("yellow")
  const [showAddHighlight, setShowAddHighlight] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  const article = articles.find((a) => a.id === selectedArticleId)

  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">Select an article</h3>
          <p className="text-sm text-muted-foreground">
            Choose an article from the list to view details and highlights
          </p>
        </div>
      </div>
    )
  }

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return
    addHighlight(article.id, {
      text: newHighlight,
      note: newHighlightNote || undefined,
      color: newHighlightColor,
    })
    setNewHighlight("")
    setNewHighlightNote("")
    setShowAddHighlight(false)
  }

  const handleSaveNote = (highlightId: string) => {
    updateHighlight(article.id, highlightId, { note: noteText || undefined })
    setEditingNote(null)
    setNoteText("")
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-muted rounded-lg">{sourceIcons[article.source]}</span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(article.createdAt, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(article.id)}>
            <Star className={cn("h-4 w-4", article.isFavorite ? "fill-yellow-400 text-yellow-400" : "")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleArchive(article.id)}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              deleteArticle(article.id)
              setSelectedArticle(null)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2 text-balance">{article.title}</h1>

          {article.author && <p className="text-muted-foreground mb-4">by {article.author}</p>}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
          >
            <ExternalLink className="h-4 w-4" />
            Open original article
          </a>

          {article.excerpt && <p className="text-muted-foreground mb-6 leading-relaxed">{article.excerpt}</p>}

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Highlighter className="h-4 w-4" />
                Highlights ({article.highlights.length})
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowAddHighlight(!showAddHighlight)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Highlight
              </Button>
            </div>

            {showAddHighlight && (
              <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
                <Textarea
                  placeholder="Paste or type the highlighted text..."
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  className="mb-3 min-h-[80px]"
                />
                <Input
                  placeholder="Add a note (optional)"
                  value={newHighlightNote}
                  onChange={(e) => setNewHighlightNote(e.target.value)}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Color:</span>
                    {highlightColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewHighlightColor(color)}
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-transform",
                          color === "yellow" && "bg-yellow-300",
                          color === "green" && "bg-green-300",
                          color === "blue" && "bg-blue-300",
                          color === "pink" && "bg-pink-300",
                          newHighlightColor === color && "scale-110 ring-2 ring-offset-2 ring-primary",
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAddHighlight(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddHighlight}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {article.highlights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No highlights yet</p>
                <p className="text-sm">Add highlights to save important passages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {article.highlights.map((highlight) => (
                  <div key={highlight.id} className={cn("p-4 rounded-lg border-l-4", colorClasses[highlight.color])}>
                    <p className="text-sm leading-relaxed mb-2">"{highlight.text}"</p>

                    {editingNote === highlight.id ? (
                      <div className="mt-3 space-y-2">
                        <Input
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add your note..."
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSaveNote(highlight.id)}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {highlight.note && (
                          <p className="text-sm text-muted-foreground italic mt-2">📝 {highlight.note}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingNote(highlight.id)
                              setNoteText(highlight.note || "")
                            }}
                          >
                            {highlight.note ? "Edit note" : "Add note"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => deleteHighlight(article.id, highlight.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
