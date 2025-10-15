const MetricCard = ({ label, value, className = "" }) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  )
}

export default MetricCard
