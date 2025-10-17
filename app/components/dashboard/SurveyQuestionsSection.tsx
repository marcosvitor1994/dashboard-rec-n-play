import type { SatisfactionBlock } from "../../types/dashboard.types"
import SatisfactionBlockCard from "./SatisfactionBlockCard"

interface SurveyQuestionsSectionProps {
  blocks: SatisfactionBlock[]
}

export default function SurveyQuestionsSection({ blocks }: SurveyQuestionsSectionProps) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#005CA9",
          marginBottom: "1.5rem",
        }}
      >
        Análise da Pesquisa de Satisfação
      </h2>

      {blocks.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {blocks.map((block, index) => (
            <SatisfactionBlockCard key={index} block={block} />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "3rem",
            textAlign: "center",
            color: "#718096",
            boxShadow: "0 2px 8px rgba(0, 91, 169, 0.1)",
          }}
        >
          Nenhum bloco de satisfação disponível. Verifique se as perguntas da pesquisa foram respondidas.
        </div>
      )}
    </div>
  )
}
