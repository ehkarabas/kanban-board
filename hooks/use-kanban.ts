'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, getTasksByColumn, createTask, updateTask, deleteTask, moveTask } from '@/lib/actions/task.actions'
import { getColumns, createColumn, updateColumn, deleteColumn } from '@/lib/actions/column.actions'
import { TaskFormData, ColumnFormData } from '@/lib/schemas'
import { Column, Task } from '@/lib/db/schema'

// Query keys
export const queryKeys = {
  columns: ['columns'] as const,
  tasks: ['tasks'] as const,
  tasksByColumn: (columnId: string) => ['tasks', 'column', columnId] as const,
}

// Hooks for fetching data
export function useColumns() {
  return useQuery({
    queryKey: queryKeys.columns,
    queryFn: async () => {
      const result = await getColumns()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
  })
}

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: async () => {
      const result = await getTasks()
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
  })
}

export function useTasksByColumn(columnId: string) {
  return useQuery({
    queryKey: queryKeys.tasksByColumn(columnId),
    queryFn: async () => {
      const result = await getTasksByColumn(columnId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!columnId,
  })
}

// Hooks for column mutations
export function useCreateColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ColumnFormData) => {
      const result = await createColumn(data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (newColumn) => {
      // Invalidate and refetch all columns
      queryClient.invalidateQueries({ queryKey: queryKeys.columns })

      // Optimistically update the columns list
      queryClient.setQueryData<Column[]>(queryKeys.columns, (oldColumns) => {
        if (!oldColumns) return [newColumn]
        return [...oldColumns, newColumn]
      })
    },
  })
}

export function useUpdateColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ columnId, data }: { columnId: string; data: ColumnFormData }) => {
      const result = await updateColumn(columnId, data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (updatedColumn) => {
      // Invalidate and refetch all columns
      queryClient.invalidateQueries({ queryKey: queryKeys.columns })

      // Optimistically update the columns list
      queryClient.setQueryData<Column[]>(queryKeys.columns, (oldColumns) => {
        if (!oldColumns) return [updatedColumn]
        return oldColumns.map(column =>
          column.id === updatedColumn.id ? updatedColumn : column
        )
      })
    },
  })
}

export function useDeleteColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (columnId: string) => {
      const result = await deleteColumn(columnId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (deletedColumn) => {
      // Update columns cache
      queryClient.setQueryData<Column[]>(queryKeys.columns, (oldColumns) => {
        if (!oldColumns) return []
        return oldColumns.filter(column => column.id !== deletedColumn.id)
      })

      // Invalidate tasks since they might be affected by column deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    },
  })
}

// Hooks for task mutations
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const result = await createTask(data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (newTask) => {
      // Invalidate and refetch all tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })

      // Optimistic Update
      // Normalde invalidateQueries ile tüm query'ler invalidated edilir. SetQueryData bu durumda gereksiz olarak düşünülebilir ancak;
      // setQueryData - Immediate olarak cache güncelleniyor (kullanıcı anında değişikliği görüyor)
      // invalidateQueries - Background'da query'ler tekrar fetch ediliyor
      // Kullanıcı experience'ı için mutation'ın başarılı olacağı varsayılıyor ve UI anında güncelleniyor. Bu sayede kullanıcı loading state beklemek zorunda kalmıyor.

      // Optimistically update the tasks list
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (oldTasks) => {
        if (!oldTasks) return [newTask]
        return [...oldTasks, newTask]
      })

      // Update tasks by column cache
      queryClient.setQueryData<Task[]>(
        queryKeys.tasksByColumn(newTask.columnId),
        (oldTasks) => {
          if (!oldTasks) return [newTask]
          return [...oldTasks, newTask]
        }
      )
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<TaskFormData> }) => {
      const result = await updateTask(taskId, data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (updatedTask) => {
      // Invalidate and refetch all tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })

      // Optimistically update the tasks list
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (oldTasks) => {
        if (!oldTasks) return [updatedTask]
        return oldTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      })

      // Update tasks by column cache
      queryClient.setQueryData<Task[]>(
        queryKeys.tasksByColumn(updatedTask.columnId),
        (oldTasks) => {
          if (!oldTasks) return [updatedTask]
          return oldTasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          )
        }
      )
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await deleteTask(taskId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (deletedTask) => {
      // Ana tasks cache'ini güncelle
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (oldTasks) => {
        if (!oldTasks) return []
        return oldTasks.filter(task => task.id !== deletedTask.id)
      })

      // İlgili column cache'ini de güncelle
      if (deletedTask.id) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasksByColumn(deletedTask.id),
          (oldTasks) => {
            if (!oldTasks) return []
            return oldTasks.filter(task => task.id !== deletedTask.id)
          }
        )
      }

      // Backup olarak invalidate et
      queryClient.invalidateQueries({ queryKey: ['tasks', 'column'] })
    },
  })
}

export function useMoveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, targetColumnId }: { taskId: string; targetColumnId: string }) => {
      const result = await moveTask(taskId, targetColumnId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (movedTask, variables) => {
      const { taskId, targetColumnId } = variables
      
      // Invalidate and refetch all tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })

      // Optimistically update the tasks list
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (oldTasks) => {
        if (!oldTasks) return [movedTask]
        return oldTasks.map(task =>
          task.id === movedTask.id ? movedTask : task
        )
      })

      // Remove task from the old column's cache
      // We need to find the old columnId from the current task data
      const currentTask = queryClient.getQueryData<Task[]>(queryKeys.tasks)?.find(t => t.id === taskId)
      if (currentTask && currentTask.columnId !== targetColumnId) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasksByColumn(currentTask.columnId),
          (oldTasks) => {
            if (!oldTasks) return []
            return oldTasks.filter(task => task.id !== taskId)
          }
        )
      }

      // Add task to the new column's cache
      queryClient.setQueryData<Task[]>(
        queryKeys.tasksByColumn(targetColumnId),
        (oldTasks) => {
          if (!oldTasks) return [movedTask]
          return [...oldTasks, movedTask]
        }
      )

      // Invalidate all column-specific task queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks', 'column'] })
    },
  })
}

// Utility hook for getting tasks filtered by column
export function useTasksByColumnFiltered(columnId: string) {
  const { data: allTasks } = useTasks()

  return {
    data: allTasks?.filter(task => task.columnId === columnId) || [],
    isLoading: false, // We're using the parent query's loading state
  }
} 