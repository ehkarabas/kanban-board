export interface AssigneeData {
  id: string
  name: string
  avatar: string
  email?: string
}

export const assignee: AssigneeData[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    email: "john.doe@company.com"
  },
  {
    id: "2", 
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    email: "jane.smith@company.com"
  },
  {
    id: "3",
    name: "Mike Johnson", 
    avatar: "https://i.pravatar.cc/150?img=3",
    email: "mike.johnson@company.com"
  },
  {
    id: "4",
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?img=4", 
    email: "sarah.williams@company.com"
  },
  {
    id: "5",
    name: "Alex Chen",
    avatar: "https://i.pravatar.cc/150?img=5",
    email: "alex.chen@company.com"
  },
  {
    id: "6",
    name: "Emily Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=6",
    email: "emily.rodriguez@company.com"
  }
]

export const getAssigneeById = (id: string): AssigneeData | undefined => {
  if (!id) return undefined
  return assignee.find(member => member.id === id)
}

export const getAssigneesByIds = (ids: string[]): AssigneeData[] => {
  if (!ids || !Array.isArray(ids)) return []
  return assignee.filter(member => ids.includes(member.id))
}

export const getAssigneeName = (assigneeId: string | null): string => {
  if (!assigneeId) return "Unknown"
  const assigneeNames: Record<string, string> = {
    "1": "John Doe",
    "2": "Jane Smith", 
    "3": "Mike Johnson",
    "4": "Sarah Williams",
    "5": "Alex Chen",
    "6": "Emily Rodriguez"
  }
  return assigneeNames[assigneeId] || "Unknown"
} 