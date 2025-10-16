interface Comment {
  id: number
  comment: string
  date: string
  age?: string
  isClient?: string
}

interface CommentsCardProps {
  comments: Comment[]
}

export default function CommentsCard({ comments }: CommentsCardProps) {
  const displayedComments = comments // Mostrar todos os comentários

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
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#005CA9",
          marginBottom: "1rem",
        }}
      >
        Comentários da Pesquisa de Satisfação
      </h2>
      <div
        style={{
          fontSize: "0.875rem",
          color: "#718096",
          marginBottom: "1rem",
        }}
      >
        Total de comentários: <strong>{comments.length}</strong>
      </div>

      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingRight: "0.5rem",
        }}
      >
        {displayedComments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#a0aec0",
              fontStyle: "italic",
            }}
          >
            Nenhum comentário disponível
          </div>
        ) : (
          displayedComments.map((comment) => (
            <div
              key={`${comment.id}-${comment.date}`}
              style={{
                background: "#F7FAFC",
                borderLeft: "4px solid #0066B3",
                borderRadius: "8px",
                padding: "1rem",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 102, 179, 0.15)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#2d3748",
                  lineHeight: "1.6",
                  marginBottom: "0.75rem",
                }}
              >
                {comment.comment}
              </div>

              {/* Informações secundárias */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "0.5rem",
                }}
              >
                {comment.age && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      color: "#4a5568",
                      background: "#EDF2F7",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Idade:</span>
                    <span>{comment.age}</span>
                  </div>
                )}
                {comment.isClient && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      color: "#4a5568",
                      background: comment.isClient.toLowerCase() === "sim" ? "#C6F6D5" : "#FED7D7",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Cliente BB:</span>
                    <span>{comment.isClient}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#a0aec0",
                  textAlign: "right",
                }}
              >
                {new Date(comment.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #EDF2F7;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
      `}</style>
    </div>
  )
}
