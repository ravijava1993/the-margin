"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ArticleList } from "@/components/article-list"
import { ArticleReader } from "@/components/article-reader"
import { AddArticleModal } from "@/components/add-article-modal"
import { ExtensionSync } from "@/components/extension-sync"
import { Flashcards } from "@/components/flashcards"
import { Badges } from "@/components/badges"
import { ImportClipsButton } from "@/components/import-clips-button"
import { AllHighlights } from "@/components/all-highlights"
import { DemoBanner } from "@/components/demo-banner"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useArticleStore } from "@/lib/store"
import Image from "next/image"

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showBadges, setShowBadges] = useState(false)
  const [showImportClips, setShowImportClips] = useState(false)
  const [showAllHighlights, setShowAllHighlights] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const { selectedArticleId, setSelectedArticle } = useArticleStore()

  useEffect(() => {
    const demoMode = localStorage.getItem("the-margin-demo-mode") === "true"
    setIsDemoMode(demoMode)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar
            onAddArticle={() => {
              setShowAddModal(true)
              setSidebarOpen(false)
            }}
            onOpenFlashcards={() => {
              setShowFlashcards(true)
              setSidebarOpen(false)
            }}
            onOpenBadges={() => {
              setShowBadges(true)
              setSidebarOpen(false)
            }}
            onImportClips={() => {
              setShowImportClips(true)
              setSidebarOpen(false)
            }}
            onOpenAllHighlights={() => {
              setShowAllHighlights(true)
              setSidebarOpen(false)
            }}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            isDemoMode={isDemoMode}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Image src="/icon.png" alt="The Margin" width={28} height={28} className="rounded-lg" />
              <span className="font-semibold tracking-tight">The Margin</span>
            </div>
          </div>

          {/* Article list */}
          <div className={`w-full lg:w-[380px] flex-shrink-0 ${selectedArticleId ? "hidden lg:block" : ""}`}>
            <ArticleList />
          </div>

          {/* Article reader */}
          <div className={`flex-1 ${selectedArticleId ? "flex" : "hidden lg:flex"}`}>
            <ArticleReader />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddArticleModal onClose={() => setShowAddModal(false)} />}
      {showFlashcards && <Flashcards onClose={() => setShowFlashcards(false)} />}
      {showBadges && <Badges onClose={() => setShowBadges(false)} />}

      {showImportClips && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full">
            <ImportClipsButton onClose={() => setShowImportClips(false)} isModal />
          </div>
        </div>
      )}

      {showAllHighlights && (
        <AllHighlights
          onClose={() => setShowAllHighlights(false)}
          onSelectArticle={(articleId) => {
            setSelectedArticle(articleId)
          }}
        />
      )}

      <ExtensionSync />
    </div>
  )
}
