import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/icon.png" alt="The Margin" width={40} height={40} className="rounded-lg" />
          <span className="text-2xl font-semibold text-white">The Margin</span>
        </div>

        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-zinc-400">
              {params?.error ? `Error: ${params.error}` : "An unexpected error occurred during authentication."}
            </p>
          </div>

          <div className="pt-4">
            <Link href="/auth/login">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Try again</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
