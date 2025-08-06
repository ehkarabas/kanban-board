// Shared constants for the application

export const priorityConfig = {
  low: { 
    borderColor: "border-l-green-500 dark:border-l-green-400", 
    borderWidth: "border-l-8" 
  },
  medium: { 
    borderColor: "border-l-yellow-500 dark:border-l-yellow-400", 
    borderWidth: "border-l-8" 
  },
  high: { 
    borderColor: "border-l-red-500 dark:border-l-red-400", 
    borderWidth: "border-l-8" 
  }
} as const

export const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500", 
  high: "bg-red-500"
} as const 