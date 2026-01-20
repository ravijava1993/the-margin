"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, Shield, UserPlus } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"

interface UserMenuProps {
  isDemoMode?: boolean
}

export function UserMenu({ isDemoMode }: UserMenuProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      if (isDemoMode) {
        setIsLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
        setIsAdmin(profile?.is_admin || false)
      }
      setIsLoading(false)
    }
    getUser()
  }, [isDemoMode])

  async function handleLogout() {
    localStorage.removeItem("the-margin-demo-mode")
    localStorage.removeItem("the-margin-demo-banner-dismissed")
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
  }

  if (isDemoMode || !user) {
    return (
      <Link href="/auth/sign-up">
        <Button
          variant="ghost"
          className="h-8 gap-1.5 rounded-full bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 px-3 text-xs font-medium"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Sign up
        </Button>
      </Link>
    )
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 p-0"
        >
          <span className="text-xs font-medium">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white truncate">{user.email}</p>
          <p className="text-xs text-zinc-500">{isAdmin ? "Admin" : "Member"}</p>
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => router.push("/admin")}
            className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
