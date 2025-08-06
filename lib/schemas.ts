import * as z from "zod"

// Task validation schema (shared between client and server)
export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assigneeId: z.string().optional(),
  columnId: z.string().min(1, "Column ID is required"),
})

export type TaskFormData = z.infer<typeof taskSchema>

// Client-side task schema (without columnId since it's passed separately)
export const clientTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assigneeId: z.string().optional(),
})

export type ClientTaskFormData = z.infer<typeof clientTaskSchema>

// Column validation schema (shared between client and server)
export const columnSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  description: z.string().optional(),
})

export type ColumnFormData = z.infer<typeof columnSchema>

// Client-side column schema
export const clientColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  description: z.string().optional(),
})

export type ClientColumnFormData = z.infer<typeof clientColumnSchema> 