"use client"

import { useEffect } from "react"
import type { Activation } from "../../types/dashboard.types"

interface FilterOffcanvasProps {
  isOpen: boolean
  onClose: () => void
  title: string

  // Filtro de Ativação
  showActivationFilter?: boolean
  activations?: Activation[]
  selectedActivation?: number | undefined
  onActivationChange?: (activationId: number | undefined) => void

  // Filtro de Data
  showDateFilter?: boolean
  availableDates?: string[]
  selectedDate?: string
  onDateChange?: (date: string) => void
}

export default function FilterOffcanvas({
  isOpen,
  onClose,
  title,
  showActivationFilter = false,
  activations = [],
  selectedActivation,
  onActivationChange,
  showDateFilter = false,
  availableDates = [],
  selectedDate,
  onDateChange,
}: FilterOffcanvasProps) {
  // Bloquear scroll do body quando offcanvas está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleClearFilters = () => {
    if (onActivationChange) onActivationChange(undefined)
    if (onDateChange) onDateChange("")
  }

  const hasActiveFilters = selectedActivation || selectedDate

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            transition: "opacity 0.3s",
          }}
        />
      )}

      {/* Offcanvas */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: isOpen ? "20px" : "-400px",
          width: "350px",
          maxWidth: "90vw",
          height: "auto",
          borderRadius: "8px",
          backgroundColor: "white",
          boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          transition: "right 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
              color: "#718096",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          {showActivationFilter && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#2d3748",
                }}
              >
                Ativação
              </label>
              <select
                value={selectedActivation || ""}
                onChange={(e) =>
                  onActivationChange?.(e.target.value ? Number(e.target.value) : undefined)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                  fontSize: "0.95rem",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">Todas as ativações</option>
                {activations.map((activation) => (
                  <option key={activation.id} value={activation.id}>
                    {activation.nome}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: "0.8rem", color: "#718096", marginTop: "0.5rem" }}>
                Filtra os dados apenas para a ativação selecionada
              </p>
            </div>
          )}

          {showDateFilter && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#2d3748",
                }}
              >
                Data Específica
              </label>
              <select
                value={selectedDate || ""}
                onChange={(e) => onDateChange?.(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                  fontSize: "0.95rem",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">Todas as datas (média)</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: "0.8rem", color: "#718096", marginTop: "0.5rem" }}>
                Selecione uma data específica para análise detalhada
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                background: "#fff",
                color: "#e53e3e",
                border: "2px solid #e53e3e",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#fff5f5"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#fff"
              }}
            >
              Limpar Filtros
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              background: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#2c5282"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#3182ce"
            }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  )
}
