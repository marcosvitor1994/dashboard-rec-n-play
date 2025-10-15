interface MetricCardProps {
  label: string
  value: string | number
  className?: string
}

export default function MetricCard({ label, value, className = "" }: MetricCardProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      className={className}
    >
      <div
        style={{
          fontSize: "0.875rem",
          color: "#718096",
          marginBottom: "0.5rem",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2d3748" }}>{value}</div>
    </div>
  )
}
