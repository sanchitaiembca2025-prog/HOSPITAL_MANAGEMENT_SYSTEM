import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex items-center gap-1 text-xs text-neutral-400">
              {breadcrumb.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-primary-600 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-neutral-600">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="ml-4 shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  )
}
