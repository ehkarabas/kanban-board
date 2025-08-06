"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"
import { ColumnDialog } from "./column-dialog"
import { Column, Task } from "@/lib/db/schema"
import { KanbanBoardClientProps } from "@/lib/types"
import { getAssigneeName } from "@/lib/assignee"
import ErrorBoundary from "./error-boundary"
import TaskErrorFallback from "./task-error-fallback"
import { KanbanErrorFallback } from "./kanban-error-fallback"
import { useColumns, useTasks, useCreateTask, useUpdateTask, useDeleteColumn } from "@/hooks/use-kanban"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreVertical, Edit3, Trash2, Plus } from "lucide-react"

function KanbanBoardContent() {
  const { data: columns = [], isLoading: columnsLoading, error: columnsError } = useColumns()
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteColumnMutation = useDeleteColumn()
  const [columnDropdownStates, setColumnDropdownStates] = useState<Record<string, boolean>>({})

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((task: Task) => task.columnId === columnId)
  }

  const handleAssigneeChange = async (taskId: string, assigneeId: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        data: {
          assigneeId: assigneeId === "unassigned" ? undefined : assigneeId,
        },
      })
    } catch (error) {
      console.error('Error updating assignee:', error)
      throw error // Re-throw to be caught by error boundary
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    // This is now handled by React Query mutation
    console.log('Task created:', newTask)
  }

  const handleColumnCreated = (newColumn: Column) => {
    // This is now handled by React Query mutation
    console.log('Column created:', newColumn)
  }

  const handleColumnDeleted = async (columnId: string) => {
    try {
      await deleteColumnMutation.mutateAsync(columnId)
    } catch (error) {
      console.error('Error deleting column:', error)
      throw error // Re-throw to be caught by error boundary
    }
  }

  const handleColumnDropdownChange = (columnId: string, open: boolean) => {
    setColumnDropdownStates(prev => ({
      ...prev,
      [columnId]: open
    }))
  }

  const closeColumnDropdown = (columnId: string) => {
    setColumnDropdownStates(prev => ({
      ...prev,
      [columnId]: false
    }))
  }

  // Show loading state
  if (columnsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-0">
              <Card className="h-full">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-20 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // // Show error state (manual error handling instead of using error boundary)
  // if (columnsError || tasksError) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <p className="text-red-500">
  //         Error loading data: {columnsError?.message || tasksError?.message}
  //       </p>
  //     </div>
  //   )
  // }

  // Let errors bubble up to error boundary instead of handling manually
  // Error bubbling: Instead of manual error handling, errors are thrown and caught by the boundary
  // Better UX: Users get retry buttons and proper error categorization
  if (columnsError) throw columnsError
  if (tasksError) throw tasksError

  return (
    <div className="space-y-6">
      {/* Add Column Button */}
      <div className="flex justify-end items-center">
        <ColumnDialog
          mode="create"
          onColumnCreated={handleColumnCreated}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column: Column) => (
          <div key={column.id} className="min-w-0">
            <Card className="h-full shadow-lg border border-gray-300 dark:border-gray-700 group">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{column.title}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-normal text-muted-foreground bg-gray-300 dark:bg-muted px-2 py-1 rounded-full">
                      {getTasksByColumn(column.id).length}
                    </span>

                    {/* Column Actions Dropdown */}
                    <DropdownMenu
                      open={columnDropdownStates[column.id] || false}
                      onOpenChange={(open) => handleColumnDropdownChange(column.id, open)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-gray-400 dark:border-gray-600"
                      >
                        <ColumnDialog
                          mode="edit"
                          column={column}
                          onDialogClose={() => closeColumnDropdown(column.id)}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800 cursor-pointer"
                            >
                              <Edit3 size={14} className="mr-2" />
                              Edit Column
                            </DropdownMenuItem>
                          }
                        />
                        <AlertDialog onOpenChange={(open) => !open && closeColumnDropdown(column.id)}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="hover:bg-red-100 dark:hover:bg-red-900 focus:bg-red-100 dark:focus:bg-red-900 cursor-pointer text-red-600 dark:text-red-400"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Column
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Column</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this column? This action will also delete all tasks in this column and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="transition-colors hover:bg-gray-400 dark:hover:bg-gray-500 focus:bg-gray-200 dark:focus:bg-gray-700 border-gray-400 dark:border-gray-600"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleColumnDeleted(column.id)}
                                className="bg-red-600 hover:bg-red-400 focus:ring-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
                {column.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {column.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {getTasksByColumn(column.id).map((task: Task) => (
                  <ErrorBoundary key={task.id} fallback={TaskErrorFallback}>
                    <TaskCard
                      task={{
                        id: task.id,
                        title: task.title,
                        description: task.description || undefined,
                        priority: task.priority as "low" | "medium" | "high",
                        assignee: task.assigneeId ? {
                          id: task.assigneeId,
                          name: getAssigneeName(task.assigneeId),
                          avatar: ""
                        } : undefined
                      }}
                      columnId={column.id}
                      onAssigneeChange={handleAssigneeChange}
                    />
                  </ErrorBoundary>
                ))}
                {getTasksByColumn(column.id).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">No tasks</p>
                  </div>
                )}

                {/* Add Task Button */}
                <div className="pt-2">
                  <TaskDialog
                    mode="create"
                    columnId={column.id}
                    onTaskCreated={handleTaskCreated}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-sm border-dashed border-gray-400 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-800"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Task
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KanbanBoardClient() {
  return (
    <ErrorBoundary fallback={KanbanErrorFallback}>
      <KanbanBoardContent />
    </ErrorBoundary>
  )
} 