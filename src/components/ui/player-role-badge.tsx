
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PlayerRoleBadgeProps {
  role: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const PlayerRoleBadge = ({ role, size = "sm", className }: PlayerRoleBadgeProps) => {
  const getRoleConfig = (role: string) => {
    const normalizedRole = role?.toLowerCase() || 'starter'
    
    switch (normalizedRole) {
      case 'captain':
        return {
          variant: "default" as const,
          label: "Captain",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800"
        }
      case 's-class':
        return {
          variant: "secondary" as const,
          label: "S-Class",
          className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800"
        }
      case 'starter':
        return {
          variant: "outline" as const,
          label: "Starter",
          className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800"
        }
      default:
        return {
          variant: "outline" as const,
          label: role || "Player",
          className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
        }
    }
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  }

  const config = getRoleConfig(role)

  return (
    <Badge
      variant={config.variant}
      className={cn(
        sizeClasses[size],
        config.className,
        "font-medium",
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

export default PlayerRoleBadge
