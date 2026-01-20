import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/icon.png" alt="The Margin" width={40} height={40} className="rounded-lg" />
          <span className="text-2xl font-semibold text-white">The Margin</span>
        </div>

        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
          <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-violet-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Check your email</h1>
            <p className="text-zinc-400">
              We&apos;ve sent you a confirmation link. Please check your email to verify your account before signing in.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
