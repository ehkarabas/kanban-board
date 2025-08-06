"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { User, Edit3, MoreVertical, Trash2, ArrowRight, ArrowLeft } from "lucide-react"
import { TaskDialog } from "./task-dialog"
import { assignee, getAssigneeById } from "@/lib/assignee"
import { Task, TaskCardProps } from "@/lib/types"
import { priorityConfig } from "@/lib/constants"
import ErrorBoundary from "./error-boundary"
import { useDeleteTask, useMoveTask, useColumns } from "@/hooks/use-kanban"

export function TaskCard({ task, columnId, onAssigneeChange }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const deleteTaskMutation = useDeleteTask()
  const moveTaskMutation = useMoveTask()
  const { data: columns = [] } = useColumns()

  // Get available columns for moving (excluding current column)
  const availableColumns = columns.filter((column) => column.id !== columnId)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleAssigneeChange = (assigneeId: string) => {
    if (onAssigneeChange) {
      onAssigneeChange(task.id, assigneeId)
    }
    // Removed setIsEditing(false) from here since we handle it in onValueChange
  }

  const handleTaskDeleted = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error // Re-throw to be caught by error boundary
    }
  }

  const handleMoveTask = async (targetColumnId: string) => {
    try {
      await moveTaskMutation.mutateAsync({ taskId: task.id, targetColumnId })
      setDropdownOpen(false)
    } catch (error) {
      console.error('Error moving task:', error)
      throw error // Re-throw to be caught by error boundary
    }
  }

  // Get the full assignee data for the current assignee
  const currentAssignee = task.assignee ? getAssigneeById(task.assignee.id) : null

  // Add error handling for missing assignee data
  if (!currentAssignee && task.assignee) {
    console.warn(`Assignee with id ${task.assignee.id} not found`)
  }

  return (
    <Card className={`mb-3 hover:shadow-xl shadow-lg transition-all duration-200 border border-gray-300 dark:border-gray-700 group ${
      task.priority 
        ? `${priorityConfig[task.priority].borderColor} ${priorityConfig[task.priority].borderWidth}` 
        : "border-l-gray-300 dark:border-l-gray-600 border-l-8"
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight flex-1 pr-2">
            {task.title}
          </CardTitle>
          
          {/* Task Actions Dropdown */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
              <TaskDialog
                mode="edit"
                task={task}
                columnId={columnId}
                onDialogClose={() => setDropdownOpen(false)}
                trigger={
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800 cursor-pointer"
                  >
                    <Edit3 size={14} className="mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                }
              />
              
              {/* Move Task Options - Only show if there are available columns */}
              {availableColumns.length > 0 && (
                <>
                  {/* Move to Left (if there's a column with lower order) */}
                  {(() => {
                    const currentColumn = columns.find(c => c.id === columnId)
                    return currentColumn && availableColumns.some(col => col.order < currentColumn.order)
                  })() && (
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault()
                        const currentColumn = columns.find(c => c.id === columnId)
                        if (currentColumn) {
                          const leftColumn = availableColumns
                            .filter(col => col.order < currentColumn.order)
                            .sort((a, b) => b.order - a.order)[0] // Get the closest column to the left
                          if (leftColumn) {
                            handleMoveTask(leftColumn.id)
                          }
                        }
                      }}
                      className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800 cursor-pointer"
                    >
                      <ArrowLeft size={14} className="mr-2" />
                      Move Left
                    </DropdownMenuItem>
                  )}
                  
                  {/* Move to Right (if there's a column with higher order) */}
                  {(() => {
                    const currentColumn = columns.find(c => c.id === columnId)
                    return currentColumn && availableColumns.some(col => col.order > currentColumn.order)
                  })() && (
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault()
                        const currentColumn = columns.find(c => c.id === columnId)
                        if (currentColumn) {
                          const rightColumn = availableColumns
                            .filter(col => col.order > currentColumn.order)
                            .sort((a, b) => a.order - b.order)[0] // Get the closest column to the right
                          if (rightColumn) {
                            handleMoveTask(rightColumn.id)
                          }
                        }
                      }}
                      className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800 cursor-pointer"
                    >
                      <ArrowRight size={14} className="mr-2" />
                      Move Right
                    </DropdownMenuItem>
                  )}
                  
                  {/* Show all available columns if there are more than 2 columns */}
                  {availableColumns.length > 2 && (
                    <>
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs text-gray-500 dark:text-gray-400 cursor-default"
                        disabled
                      >
                        Move to specific column:
                      </DropdownMenuItem>
                      {availableColumns.map((column) => (
                        <DropdownMenuItem 
                          key={column.id}
                          onSelect={(e) => {
                            e.preventDefault()
                            handleMoveTask(column.id)
                          }}
                          className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800 cursor-pointer pl-6"
                        >
                          {column.title}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}
              <AlertDialog onOpenChange={(open) => !open && setDropdownOpen(false)}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="hover:bg-red-100 dark:hover:bg-red-900 focus:bg-red-100 dark:focus:bg-red-900 cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="transition-colors hover:bg-gray-400 dark:hover:bg-gray-500 focus:bg-gray-200 dark:focus:bg-gray-700 border-gray-400 dark:border-gray-600"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleTaskDeleted()}
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
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {currentAssignee ? (
              <>
                <Avatar className="h-7 w-7">
                  <AvatarImage 
                    src={currentAssignee.avatar} 
                    alt={currentAssignee.name}
                    onError={(e) => {
                      // Fallback to initials if avatar fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {getInitials(currentAssignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentAssignee.name}</span>
              </>
            ) : (
              <>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                    <User size={14} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
              </>
            )}
          </div>
          
          <Popover open={isEditing} onOpenChange={setIsEditing}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity border-gray-400 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-800 hover:border-gray-500 dark:hover:border-gray-500 cursor-pointer"
              >
                <Edit3 size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Assign to</h4>
                <Select 
                  value={task.assignee?.id || "unassigned"} 
                  onValueChange={(value) => {
                    handleAssigneeChange(value)
                    setIsEditing(false) // Close the popover when selection is made
                  }}
                  onOpenChange={(open) => {
                    // Close popover if select dropdown closes
                    if (!open) {
                      setIsEditing(false)
                    }
                  }}
                >
                  <SelectTrigger className="hover:bg-gray-300 dark:hover:bg-gray-800 border-gray-400 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 cursor-pointer">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-400 dark:border-gray-600">
                    <SelectItem 
                      value="unassigned"
                      className="hover:bg-gray-200 dark:hover:bg-gray-800 focus:bg-gray-200 dark:focus:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            <User size={12} />
                          </AvatarFallback>
                        </Avatar>
                        <span>Unassigned</span>
                      </div>
                    </SelectItem>
                    {assignee.map((member) => (
                      <SelectItem 
                        key={member.id} 
                        value={member.id}
                        className="hover:bg-gray-200 dark:hover:bg-gray-800 focus:bg-gray-200 dark:focus:bg-gray-800 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
} 