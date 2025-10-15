import type { Activation } from "../../types/dashboard.types"

interface DashboardFiltersProps {
  activations: Activation[]
  availableDates: string[]
  selectedActivation: number | undefined
  selectedDate: string
  onActivationChange: (activationId: number | undefined) => void
  onDateChange: (date: string) => void
  onClearFilters: () => void
}

export default function DashboardFilters({
  activations,
  availableDates,
  selectedActivation,
  selectedDate,
  onActivationChange,
  onDateChange,
  onClearFilters,
}: DashboardFiltersProps) {
  return (
    <div
      style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: 600 }}>Filtros</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        <div>
          <label
            style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}
          >
            Ativação{" "}
            <span style={{ fontSize: "0.8rem", color: "#666" }}>
              (afeta Check-ins, Faixa Etária, Intenção e Horários)
            </span>
          </label>
          <select
            value={selectedActivation || ""}
            onChange={(e) => onActivationChange(e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Todas as ativações</option>
            {activations.map((activation) => (
              <option key={activation.id} value={activation.id}>
                {activation.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}
          >
            Data Específica{" "}
            <span style={{ fontSize: "0.8rem", color: "#666" }}>(afeta Picos de Horário)</span>
          </label>
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Todas as datas (média)</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(selectedActivation || selectedDate) && (
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={onClearFilters}
            style={{
              padding: "0.5rem 1rem",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  )
}
