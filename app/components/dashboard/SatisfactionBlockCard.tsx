import type { SatisfactionBlock } from "../../types/dashboard.types"

interface SatisfactionBlockCardProps {
  block: SatisfactionBlock
}

export default function SatisfactionBlockCard({ block }: SatisfactionBlockCardProps) {
  // Definir cores baseadas no tipo de bloco
  const getBlockColors = () => {
    switch (block.type) {
      case 'satisfaction':
        return {
          gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          border: '#4A90E2',
          icon: '😊',
        }
      case 'positioning':
        return {
          gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
          border: '#9B59B6',
          icon: '🎯',
        }
      case 'relationship':
        return {
          gradient: 'linear-gradient(135deg, #FF6B9D 0%, #E84393 100%)',
          border: '#FF6B9D',
          icon: '🤝',
        }
      default:
        return {
          gradient: 'linear-gradient(135deg, #0066B3 0%, #005CA9 100%)',
          border: '#0066B3',
          icon: '📊',
        }
    }
  }

  const colors = getBlockColors()

  // Determinar se a variação é positiva ou negativa
  const getVariationColor = () => {
    if (!block.variation) return '#718096'
    return block.variation > 0 ? '#48BB78' : '#F56565'
  }

  const getVariationIcon = () => {
    if (!block.variation) return ''
    return block.variation > 0 ? '▲' : '▼'
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 91, 169, 0.1)',
        border: `2px solid ${colors.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header com gradiente */}
      <div
        style={{
          background: colors.gradient,
          color: 'white',
          padding: '1rem',
          margin: '-1.5rem -1.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>{colors.icon}</span>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
          {block.title}
        </h3>
      </div>

      {/* Métricas principais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Nota Média */}
        <div>
          <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
            Nota Média
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: colors.border,
              lineHeight: 1,
            }}
          >
            {block.averageScore.toFixed(2)}
            <span style={{ fontSize: '1rem', color: '#A0AEC0', marginLeft: '0.25rem' }}>/5</span>
          </div>
        </div>

        {/* Grau (%) */}
        <div>
          <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
            Grau de Satisfação
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: colors.border,
              lineHeight: 1,
            }}
          >
            {block.grade.toFixed(1)}
            <span style={{ fontSize: '1rem', color: '#A0AEC0', marginLeft: '0.25rem' }}>%</span>
          </div>
        </div>
      </div>

      {/* Variação (se disponível) */}
      {block.variation !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: '#F7FAFC',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <span style={{ color: getVariationColor(), fontWeight: 600 }}>
            {getVariationIcon()}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#4A5568' }}>
            Variação:{' '}
            <strong style={{ color: getVariationColor() }}>
              {block.variation > 0 ? '+' : ''}
              {block.variation.toFixed(1)}%
            </strong>
          </span>
        </div>
      )}

      {/* Perguntas do bloco */}
      <div
        style={{
          borderTop: '1px solid #E2E8F0',
          paddingTop: '1rem',
        }}
      >
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2D3748', marginBottom: '0.75rem' }}>
          Perguntas incluídas:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {block.questions.map((question, index) => (
            <div
              key={index}
              style={{
                padding: '0.75rem',
                background: '#F7FAFC',
                borderRadius: '6px',
                borderLeft: `3px solid ${colors.border}`,
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#4A5568', marginBottom: '0.25rem' }}>
                {question.pergunta}
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                  Média: <strong style={{ color: colors.border }}>{question.media.toFixed(2)}</strong>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                  Grau: <strong style={{ color: colors.border }}>{question.grau.toFixed(1)}%</strong>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>
                  {question.totalRespostas} respostas
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
