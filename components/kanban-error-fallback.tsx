"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Database } from 'lucide-react'

interface KanbanErrorFallbackProps {
  error?: Error
  resetError: () => void
}

export function KanbanErrorFallback({ error, resetError }: KanbanErrorFallbackProps) {
  const isDatabaseError = error?.message?.includes('database') || 
                         error?.message?.includes('connection') ||
                         error?.message?.includes('Failed to fetch')

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            {isDatabaseError ? (
              <Database className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-red-700 dark:text-red-300">
            {isDatabaseError ? 'Database Connection Error' : 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">
            {isDatabaseError 
              ? 'Unable to load tasks and columns. Please check your database connection.'
              : error?.message || 'An unexpected error occurred while loading the board.'
            }
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={resetError}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
            >
              <RefreshCw size={14} className="mr-2" />
              Retry
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              size="sm"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 