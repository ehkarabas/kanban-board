'use server'

import { prisma } from '@/lib/db/prisma'
import { taskSchema, TaskFormData } from '@/lib/schemas'
import * as z from 'zod'
import { revalidatePath } from 'next/cache'

// Use Prisma generated types
type Task = {
  id: string
  title: string
  description: string | null
  order: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  assigneeId: string | null
  dueDate: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  columnId: string
}

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

const ARTIFICIAL_DELAY_MS = 0

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function createTask(data: TaskFormData): Promise<ApiResponse<Task>> {
  try {
    // Validate input on server-side
    const validatedData = taskSchema.parse(data)
    
    // Validate column exists
    const columnExists = await prisma.column.findFirst({
      where: {
        id: validatedData.columnId,
        deletedAt: null
      }
    })
    
    if (!columnExists) {
      return { success: false, error: 'Invalid column ID' }
    }
    
    // Get the next order for this column (only non-deleted tasks)
    const existingTasks = await prisma.task.findMany({
      where: {
        columnId: validatedData.columnId,
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    const nextOrder = existingTasks.length
    
    // Map priority values to match Prisma enum
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    if (validatedData.priority === 'low') priority = 'LOW'
    else if (validatedData.priority === 'high') priority = 'HIGH'
    
    const newTask = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        priority: priority,
        assigneeId: validatedData.assigneeId || null,
        columnId: validatedData.columnId,
        order: nextOrder,
      }
    })


    // Yeni Request Geldiğinde - Fresh data ile yeniden generate edilir
    // Server-side: Full Route Cache global invalidation
    // Client-side: Router Cache invalidation (sadece action yapan user)
    // staleTimes: İnvalidation sonrası yeniden geçerli olur
    // Other users: Sadece server cache etkiler, router cache'leri bozulmaz
    // Full Route Cache: Server-side cache (Next.js server'ında), HTML + RSC payload, build time'da oluşur, yalnızca production'da aktif, revalidatePath (router cache'i de invalidate eder) ile yeniden geçerli olur.
    // Router Cache: Client-side cache (browser'da), RSC payload (HTML yok), navigation sırasında oluşur, development ve production'da aktif, staleTimes ile yeniden geçerli olur.
    // Full Route Cache -> Global Effect - Tüm user'lar için geçerli
    // Global Cache Effect
    // User A Creates Task
    // // User A: Task create eder
    // await createTask({ title: "New Task", columnId: 1 });
    // // revalidatePath('/') çalışır
    // // → Global cache invalidate
    // User B Gets Fresh Data
    // // User B: Sayfa yeniler (User A'dan sonra)
    // // → Fresh data alır (User A'nın task'i dahil)
    // // → Yeni static page generate edilir
    // Shared cache etkisi:
    // ✅ User A'nın değişikliği tüm user'lara yansır
    // ⚠️ Cache invalidation maliyetli (yeniden generate)
    // 🚀 Sonraki request'ler yine cache'den serve edilir
    revalidatePath('/')
    
    return { success: true, data: newTask }
  } catch (error) {
    console.error('Error creating task:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create task' }
  }
}



export async function getTasks(): Promise<ApiResponse<Task[]>> {
  // to check caching
  // console.log('🔍 getTasks called at:', new Date().toISOString());
  await delay(ARTIFICIAL_DELAY_MS)
  try {
    const result = await prisma.task.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
    // console.log('📊 Database query executed, returned:', result.length, 'tasks');
    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function getTasksByColumn(columnId: string): Promise<ApiResponse<Task[]>> {
  await delay(ARTIFICIAL_DELAY_MS)
  try {
    const result = await prisma.task.findMany({
      where: {
        columnId: columnId,
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching tasks by column:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to fetch tasks by column' }
  }
} 

export async function updateTask(taskId: string, data: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
  try {
    // Check if task exists and is not deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null
      }
    })

    if (!existingTask) {
      return { success: false, error: 'Task not found' }
    }

    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.priority !== undefined) {
      // Map priority values to match Prisma enum
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
      if (data.priority === 'low') priority = 'LOW'
      else if (data.priority === 'high') priority = 'HIGH'
      updateData.priority = priority
    }
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId || null
    if (data.columnId !== undefined) updateData.columnId = data.columnId

    // Always update updatedAt to now
    updateData.updatedAt = new Date()

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    })

    revalidatePath('/')
    return { success: true, data: updatedTask }
  } catch (error) {
    console.error('Error updating task:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(taskId: string): Promise<ApiResponse<{ id: string }>> {
  try {
    // Check if task exists and is not deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null
      }
    })

    if (!existingTask) {
      return { success: false, error: 'Task not found' }
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    revalidatePath('/')
    return { success: true, data: { id: taskId } }
  } catch (error) {
    console.error('Error deleting task:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete task' }
  }
}

export async function moveTask(taskId: string, targetColumnId: string): Promise<ApiResponse<Task>> {
  try {
    // Validate that the task exists and is not deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null
      }
    })

    if (!existingTask) {
      return { success: false, error: 'Task not found' }
    }

    // Validate that the target column exists and is not deleted
    const targetColumn = await prisma.column.findFirst({
      where: {
        id: targetColumnId,
        deletedAt: null
      }
    })

    if (!targetColumn) {
      return { success: false, error: 'Target column not found' }
    }

    // Get the next order for the target column (only non-deleted tasks)
    const existingTasksInTarget = await prisma.task.findMany({
      where: {
        columnId: targetColumnId,
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    const nextOrder = existingTasksInTarget.length

    // Update the task with new column and order
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        order: nextOrder,
        updatedAt: new Date()
      }
    })

    revalidatePath('/')
    return { success: true, data: updatedTask }
  } catch (error) {
    console.error('Error moving task:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to move task' }
  }
} 