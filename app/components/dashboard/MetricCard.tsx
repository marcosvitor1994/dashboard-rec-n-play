interface MetricCardProps {
  label: string
  value: string | number
  className?: string
  backgroundImage?: string
}

export default function MetricCard({ label, value, className = "", backgroundImage }: MetricCardProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 2px 8px rgba(0, 91, 169, 0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        border: "1px solid #E8F4F8",
        position: "relative",
        overflow: "hidden",
      }}
      className={className}
    >
      {backgroundImage && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            width: "80px",
            height: "80px",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: "0.875rem",
            color: "#0066B3",
            marginBottom: "0.5rem",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 700, color: "#005CA9" }}>{value}</div>
      </div>
    </div>
  )
}
