// Shared types for the application

export interface Task {
  id: string
  title: string
  description?: string
  priority?: "low" | "medium" | "high"
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskCardProps {
  task: Task
  columnId: string
  onAssigneeChange?: (taskId: string, assigneeId: string) => void
}

export interface TaskDialogProps {
  task?: Task
  trigger?: React.ReactNode
  columnId: string
  mode?: "create" | "edit"
  onTaskCreated?: (task: any) => void
  onDialogClose?: () => void
}

export interface KanbanBoardClientProps {
  columns: any[]
  tasks: any[]
} 