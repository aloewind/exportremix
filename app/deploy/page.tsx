import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, ExternalLink, CheckCircle2 } from "lucide-react"

export default function DeployGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Deploy ExportRemix</h1>
            <p className="text-xl text-muted-foreground">Get your own instance running in minutes</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Step 1: Fork the Repository
              </CardTitle>
              <CardDescription>Create your own copy of the codebase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Visit the GitHub repository</li>
                <li>Click the "Fork" button in the top right</li>
                <li>Select your account as the destination</li>
              </ol>
              <Button asChild>
                <a
                  href="https://github.com/yourusername/exportremix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Fork on GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 22.525H0l12-21.05 12 21.05z" />
                </svg>
                Step 2: Connect to Vercel
              </CardTitle>
              <CardDescription>Deploy with one click (free tier available)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to vercel.com and sign in with GitHub</li>
                <li>Click "New Project" and import your forked repository</li>
                <li>Vercel will auto-detect Next.js configuration</li>
              </ol>
              <Button asChild>
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Deploy to Vercel
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Step 3: Add Environment Variables
              </CardTitle>
              <CardDescription>Configure your integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Add these environment variables in Vercel project settings:</p>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Supabase</Badge>
                  </div>
                  <div className="space-y-1 text-sm font-mono">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">OpenAI</Badge>
                  </div>
                  <div className="space-y-1 text-sm font-mono">
                    <div>OPENAI_API_KEY=your_openai_key</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Stripe (Optional)</Badge>
                  </div>
                  <div className="space-y-1 text-sm font-mono">
                    <div>STRIPE_SECRET_KEY=sk_test_...</div>
                    <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</div>
                    <div>STRIPE_WEBHOOK_SECRET=whsec_...</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">WTO API (Optional)</Badge>
                  </div>
                  <div className="space-y-1 text-sm font-mono">
                    <div>WTO_API_KEY=your_wto_key</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Step 4: Deploy & Test
              </CardTitle>
              <CardDescription>Your app will be live in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Click "Deploy" in Vercel</li>
                <li>Wait for build to complete (usually 2-3 minutes)</li>
                <li>Visit your live URL</li>
                <li>Test with mock data for 19% surge simulations</li>
              </ol>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium">Testing with Mocks</div>
                    <div className="text-sm text-muted-foreground">
                      Enable test mode in the admin panel to simulate 19% tariff surges and other disruptions without
                      using real API calls.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <Button asChild size="lg">
              <a href="/" className="flex items-center gap-2">
                Back to Home
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
