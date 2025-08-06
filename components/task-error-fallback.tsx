"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface TaskErrorFallbackProps {
  error?: Error
  resetError: () => void
}

export default function TaskErrorFallback({ error, resetError }: TaskErrorFallbackProps) {
  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Task Error
            </p>
            <p className="text-xs text-red-500 dark:text-red-500 truncate">
              {error?.message || 'Failed to load task'}
            </p>
          </div>
          <Button 
            onClick={resetError}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 flex-shrink-0"
          >
            <RefreshCw size={12} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 