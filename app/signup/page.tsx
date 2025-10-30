import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"
import Image from "next/image"

export default function SignupPage() {
  return (
    <div className="min-h-screen gradient-flow flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 mb-4">
            <Image src="/logo.png" alt="ExportRemix" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">ExportRemix</span>
          </Link>
          <h1 className="text-3xl font-bold">Get started free</h1>
          <p className="text-muted-foreground">Create your account and start predicting tariff surges</p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <SignupForm />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
