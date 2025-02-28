
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface TestimonialProps {
  title: string
  icon: LucideIcon
  description: string
  outcome: string
  className?: string
}

export function TestimonialCard({ 
  title,
  icon: Icon,
  description,
  outcome,
  className
}: TestimonialProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-4 text-start sm:p-6",
        "hover:from-muted/60 hover:to-muted/20",
        "w-[300px] sm:w-[320px]",
        "transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-full bg-blue-600/20 text-blue-400">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-semibold leading-none">
          {title}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <div className="mt-auto">
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400">
          {outcome}
        </span>
      </div>
    </div>
  )
}
