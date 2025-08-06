"use client"

import React, { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Edit3 } from "lucide-react"
import { clientColumnSchema, ClientColumnFormData } from "@/lib/schemas"
import { Column } from "@/lib/db/schema"
import ErrorBoundary from "./error-boundary"
import { useCreateColumn, useUpdateColumn } from "@/hooks/use-kanban"

interface ColumnDialogProps {
  column?: Column
  trigger?: React.ReactNode
  mode?: "create" | "edit"
  onColumnCreated?: (column: Column) => void
  onDialogClose?: () => void
}

export function ColumnDialog({ column, trigger, mode = "create", onColumnCreated, onDialogClose }: ColumnDialogProps) {
  const [open, setOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const createColumnMutation = useCreateColumn()
  const updateColumnMutation = useUpdateColumn()

  const form = useForm<ClientColumnFormData>({
    resolver: zodResolver(clientColumnSchema),
    defaultValues: {
      title: mode === "edit" ? column?.title || "" : "",
      description: mode === "edit" ? column?.description || "" : "",
    },
  })

  // Reset form when dialog opens/closes or column changes
  useEffect(() => {
    if (open) {
      if (mode === "create" || !column) {
        // Reset to empty values for create mode
        form.reset({
          title: "",
          description: "",
        })
      } else {
        // For edit mode, only reset if this is the first time opening with this column
        // or if the column prop has actually changed
        const currentValues = form.getValues()
        const newValues = {
          title: column.title || "",
          description: column.description || "",
        }
        
        // Check if form is empty (first time) or if column has changed
        const isFormEmpty = !currentValues.title
        const hasColumnChanged = currentValues.title !== newValues.title || currentValues.description !== newValues.description
        
        if (isFormEmpty || hasColumnChanged) {
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
  }, [open, column, form, mode])

  // Handle dialog close (including X button)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      onDialogClose?.()
    }
  }

  const handleSubmit = async (data: ClientColumnFormData) => {
    if (mode === "create") {
      try {
        const newColumn = await createColumnMutation.mutateAsync(data)
        
        setOpen(false)
        onColumnCreated?.(newColumn)
        onDialogClose?.()
      } catch (error) {
        console.error('Error creating column:', error)
        throw error // Re-throw to be caught by error boundary
      }
    } else {
      // Handle edit mode
      if (!column?.id) {
        console.error('Column ID is required for edit mode')
        return
      }

      try {
        const updatedColumn = await updateColumnMutation.mutateAsync({
          columnId: column.id,
          data,
        })
        
        setOpen(false)
        onColumnCreated?.(updatedColumn)
        onDialogClose?.()
      } catch (error) {
        console.error('Error updating column:', error)
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
      <span>Add Column</span>
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
              {mode === "create" ? "Create New Column" : "Edit Column"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Add a new column to organize your tasks and improve workflow management."
                : "Update the column title to better reflect its purpose and content."
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
                        placeholder="Enter column title..."
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
                      <textarea
                        {...field}
                        placeholder="Enter column description (optional)..."
                        className="flex min-h-[80px] w-full rounded-md border border-gray-400 dark:border-gray-600 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-gray-500 dark:focus:border-gray-400"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createColumnMutation.isPending || updateColumnMutation.isPending}
                  className="hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-400 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createColumnMutation.isPending || updateColumnMutation.isPending}>
                  {createColumnMutation.isPending || updateColumnMutation.isPending 
                    ? (mode === "create" ? "Creating..." : "Saving...") 
                    : (mode === "create" ? "Create Column" : "Save Changes")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
} 