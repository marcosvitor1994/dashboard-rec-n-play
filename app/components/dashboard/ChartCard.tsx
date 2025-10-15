import { ReactNode } from "react"

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  onFilterClick?: () => void
  hasActiveFilter?: boolean
}

export default function ChartCard({
  title,
  subtitle,
  children,
  onFilterClick,
  hasActiveFilter = false,
}: ChartCardProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 2px 8px rgba(0, 91, 169, 0.1)",
        border: "1px solid #E8F4F8",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#005CA9", margin: 0 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: "0.875rem", color: "#0066B3", marginTop: "0.25rem", fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            style={{
              padding: "0.5rem 1rem",
              background: hasActiveFilter ? "#0066B3" : "#E8F4F8",
              color: hasActiveFilter ? "white" : "#005CA9",
              border: hasActiveFilter ? "none" : "1px solid #00CED1",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (!hasActiveFilter) {
                e.currentTarget.style.background = "#D0EBF0"
              } else {
                e.currentTarget.style.background = "#005CA9"
              }
            }}
            onMouseOut={(e) => {
              if (!hasActiveFilter) {
                e.currentTarget.style.background = "#E8F4F8"
              } else {
                e.currentTarget.style.background = "#0066B3"
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {hasActiveFilter ? "Filtro Ativo" : "Filtrar"}
          </button>
        )}
      </div>
      <div style={{ height: "300px" }}>{children}</div>
    </div>
  )
}
