import { KanbanBoardLoading } from "@/components/kanban-board-loading"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="/ehlogo.png" 
              alt="CoolBoard Logo" 
              className="w-10 h-10"
            />
            <h1 className="text-4xl font-bold">CoolBoard</h1>
          </div>
          <ThemeToggle />
        </div>
        <KanbanBoardLoading />
      </div>
    </div>
  )
} 