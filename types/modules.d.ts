// Temporary type declarations until dependencies are installed
declare module '@supabase/ssr' {
  export function createServerClient(
    url: string,
    key: string,
    options: any
  ): any
}

declare module 'next/server' {
  export class NextResponse {
    static next(options?: any): NextResponse
    static redirect(url: URL | string): NextResponse
    cookies: {
      set(name: string, value: string, options?: any): void
    }
  }
  export type NextRequest = any
}

