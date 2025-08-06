'use server'

import { prisma } from '@/lib/db/prisma'
import { columnSchema, ColumnFormData } from '@/lib/schemas'
import * as z from 'zod'
import { revalidatePath } from 'next/cache'

// Use Prisma generated types
type Column = {
  id: string
  title: string
  description: string | null
  order: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

const ARTIFICIAL_DELAY_MS = 0

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function createColumn(data: ColumnFormData): Promise<ApiResponse<Column>> {
  try {
    // Validate input on server-side
    const validatedData = columnSchema.parse(data)
    
    // Get the next order for columns
    const existingColumns = await prisma.column.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    const nextOrder = existingColumns.length
    
    const newColumn = await prisma.column.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        order: nextOrder,
      }
    })

    revalidatePath('/')
    
    return { success: true, data: newColumn }
  } catch (error) {
    console.error('Error creating column:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create column' }
  }
}

export async function updateColumn(columnId: string, data: ColumnFormData): Promise<ApiResponse<Column>> {
  try {
    const validatedData = columnSchema.parse(data)
    
    // Check if column exists and is not deleted
    const existingColumn = await prisma.column.findFirst({
      where: {
        id: columnId,
        deletedAt: null
      }
    })

    if (!existingColumn) {
      return { success: false, error: 'Column not found' }
    }

    const updatedColumn = await prisma.column.update({
      where: { id: columnId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        updatedAt: new Date()
      }
    })

    revalidatePath('/')
    return { success: true, data: updatedColumn }
  } catch (error) {
    console.error('Error updating column:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update column' }
  }
}

export async function deleteColumn(columnId: string): Promise<ApiResponse<{ id: string }>> {
  try {
    // Check if column exists and is not deleted
    const existingColumn = await prisma.column.findFirst({
      where: {
        id: columnId,
        deletedAt: null
      }
    })

    if (!existingColumn) {
      return { success: false, error: 'Column not found' }
    }

    // First, soft delete all tasks in this column
    await prisma.task.updateMany({
      where: {
        columnId: columnId,
        deletedAt: null
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Then soft delete the column
    await prisma.column.update({
      where: { id: columnId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    revalidatePath('/')
    return { success: true, data: { id: columnId } }
  } catch (error) {
    console.error('Error deleting column:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete column' }
  }
}

export async function getColumns(): Promise<ApiResponse<Column[]>> {
  await delay(ARTIFICIAL_DELAY_MS)
  try {
    const result = await prisma.column.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching columns:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to fetch columns' }
  }
} 