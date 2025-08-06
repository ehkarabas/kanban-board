import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import ErrorBoundary from "@/components/error-boundary"

// const inter = Inter({ subsets: ["latin"] })
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter" // CSS variable ekle
})

export const metadata: Metadata = {
  title: "CoolBoard",
  description: "A Next.js Kanban Board application",
  icons: {
    icon: "/ehlogo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
