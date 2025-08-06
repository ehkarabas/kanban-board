import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function KanbanBoardLoading() {
  return (
    <div className="space-y-6">
      {/* Add Task Button Skeleton */}
      <div className="flex justify-end items-center">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div key={columnIndex} className="min-w-0">
            <Card className="h-full shadow-lg border border-gray-300 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: columnIndex === 1 ? 3 : columnIndex === 2 ? 1 : 2 }).map((_, taskIndex) => (
                  <div key={taskIndex} className="space-y-3 p-3 border rounded-lg">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
} 