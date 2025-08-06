'use server'

import { db } from '@/lib/db'
import { columns, tasks, Column } from '@/lib/db/schema'
import { eq, asc, isNull, and } from 'drizzle-orm'
import { columnSchema, ColumnFormData } from '@/lib/schemas'
import * as z from 'zod'
import { revalidatePath } from 'next/cache'

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
    const existingColumns = await db
      .select()
      .from(columns)
      .where(isNull(columns.deletedAt))
      .orderBy(asc(columns.order))
    
    const nextOrder = existingColumns.length
    
    const newColumn = await db.insert(columns).values({
      title: validatedData.title,
      description: validatedData.description,
      order: nextOrder,
    }).returning()

    revalidatePath('/')
    
    return { success: true, data: newColumn[0] }
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
    
    const updatedColumn = await db
      .update(columns)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        updatedAt: new Date()
      })
      .where(and(eq(columns.id, columnId), isNull(columns.deletedAt)))
      .returning()

    if (updatedColumn.length === 0) {
      return { success: false, error: 'Column not found' }
    }

    revalidatePath('/')
    return { success: true, data: updatedColumn[0] }
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
    // First, soft delete all tasks in this column
    await db
      .update(tasks)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(tasks.columnId, columnId), isNull(tasks.deletedAt)))

    // Then soft delete the column
    const deletedColumn = await db
      .update(columns)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(columns.id, columnId), isNull(columns.deletedAt)))
      .returning({ id: columns.id })

    if (deletedColumn.length === 0) {
      return { success: false, error: 'Column not found' }
    }

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
    const result = await db
      .select()
      .from(columns)
      .where(isNull(columns.deletedAt))
      .orderBy(asc(columns.order))
    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching columns:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to fetch columns' }
  }
} 