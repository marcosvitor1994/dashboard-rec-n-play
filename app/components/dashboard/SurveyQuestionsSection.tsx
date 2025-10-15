import type { SurveyQuestion } from "../../types/dashboard.types"

interface SurveyQuestionsSectionProps {
  questions: SurveyQuestion[]
}

export default function SurveyQuestionsSection({ questions }: SurveyQuestionsSectionProps) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#2d3748",
          marginBottom: "1rem",
        }}
      >
        Análise de Perguntas da Pesquisa de Experiências
      </h2>
      <div style={{ padding: "1rem" }}>
        {questions.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {questions.map((question, index) => (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  borderLeft: "4px solid #1976d2",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#333" }}>
                  {question.pergunta}
                </div>
                <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.9rem", color: "#666" }}>Média: </span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1976d2" }}>
                      {question.media.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Total de respostas: {question.totalRespostas}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            Nenhuma pergunta com respostas numéricas encontrada
          </div>
        )}
      </div>
    </div>
  )
}
