"use client"

import React, { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Plus, Edit3 } from "lucide-react"
import { assignee } from "@/lib/assignee"
import { clientTaskSchema, ClientTaskFormData } from "@/lib/schemas"
import { Task, TaskDialogProps } from "@/lib/types"
import ErrorBoundary from "./error-boundary"
import { useCreateTask, useUpdateTask } from "@/hooks/use-kanban"

export function TaskDialog({ task, trigger, columnId, mode = "create", onTaskCreated, onDialogClose }: TaskDialogProps) {
  const [open, setOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const form = useForm<ClientTaskFormData>({
    resolver: zodResolver(clientTaskSchema),
    defaultValues: {
      title: mode === "edit" ? task?.title || "" : "",
      description: mode === "edit" ? task?.description || "" : "",
      priority: mode === "edit" ? task?.priority || undefined : undefined,
      assigneeId: mode === "edit" ? task?.assignee?.id || "unassigned" : "unassigned",
    },
  })

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open) {
      if (mode === "create" || !task) {
        // Reset to empty values for create mode
        form.reset({
          title: "",
          description: "",
          priority: undefined,
          assigneeId: "unassigned",
        })
      } else {
        // For edit mode, only reset if this is the first time opening with this task
        // or if the task prop has actually changed
        const currentValues = form.getValues()
        const newValues = {
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || undefined,
          assigneeId: task.assignee?.id || "unassigned",
        }
        
        // Check if form is empty (first time) or if task has changed
        const isFormEmpty = !currentValues.title && !currentValues.description && !currentValues.priority
        const hasTaskChanged = 
          currentValues.title !== newValues.title ||
          currentValues.description !== newValues.description ||
          currentValues.priority !== newValues.priority ||
          currentValues.assigneeId !== newValues.assigneeId
        
        if (isFormEmpty || hasTaskChanged) {
          form.reset(newValues)
        }
      }

      // Clear any text selection after a brief delay
      setTimeout(() => {
        if (titleInputRef.current) {
          const len = titleInputRef.current.value.length
          titleInputRef.current.setSelectionRange(len, len)
        }
      }, 100)
    }
  }, [open, task, form, mode]) // useEffect runs every time the dialog opens, even in edit mode, and it's resetting the form to the original task values instead of preserving any user changes. so mode need to be added to the depedencies

  // Handle dialog close (including X button)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      onDialogClose?.()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleSubmit = async (data: ClientTaskFormData) => {
    if (mode === "create") {
      try {
        const newTask = await createTaskMutation.mutateAsync({
          ...data,
          assigneeId: data.assigneeId === "unassigned" ? undefined : data.assigneeId,
          columnId,
        })
        
        setOpen(false)
        onTaskCreated?.(newTask)
        onDialogClose?.()
      } catch (error) {
        console.error('Error creating task:', error)
        throw error // Re-throw to be caught by error boundary
      }
    } else {
      // Handle edit mode
      if (!task?.id) {
        console.error('Task ID is required for edit mode')
        return
      }

      try {
        const updatedTask = await updateTaskMutation.mutateAsync({
          taskId: task.id,
          data: {
            ...data,
            assigneeId: data.assigneeId === "unassigned" ? undefined : data.assigneeId,
            columnId,
          },
        })
        
        setOpen(false)
        onTaskCreated?.(updatedTask)
        onDialogClose?.()
      } catch (error) {
        console.error('Error updating task:', error)
        throw error // Re-throw to be caught by error boundary
      }
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onDialogClose?.()
  }

  const defaultTrigger = mode === "create" ? (
    <Button className="flex items-center space-x-2 cursor-pointer">
      <Plus size={16} />
      <span>Add Task</span>
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
      <Edit3 size={14} />
    </Button>
  )

  return (
    <ErrorBoundary>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] [&>button]:hover:bg-gray-200 [&>button]:dark:hover:bg-gray-800">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Task" : "Edit Task"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Create a new task with title, description, priority, and assignee to track your work items."
                : "Update task details including title, description, priority, and assignee to keep information current."
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={titleInputRef}
                        placeholder="Enter task title..."
                        className="border-gray-400 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter task description (optional)..."
                        {...field}
                        className="border-gray-400 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="border-gray-400 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400">
                          <SelectValue placeholder="Select priority (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low" className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800">
                          <span className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Low</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="medium" className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800">
                          <span className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span>Medium</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="high" className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800">
                          <span className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span>High</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
                      <FormControl>
                        <SelectTrigger className="border-gray-400 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400">
                          <SelectValue placeholder="Select assignee (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-gray-400 dark:border-gray-600">
                        <SelectItem value="unassigned" className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800">
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
                          <SelectItem key={member.id} value={member.id} className="hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800">
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                  className="hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-400 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                  {createTaskMutation.isPending || updateTaskMutation.isPending 
                    ? (mode === "create" ? "Creating..." : "Saving...") 
                    : (mode === "create" ? "Create Task" : "Save Changes")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
} 