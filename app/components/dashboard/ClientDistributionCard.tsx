import type { ClientDistribution } from "../../types/dashboard.types"

interface ClientDistributionCardProps {
  distribution: ClientDistribution
}

export default function ClientDistributionCard({ distribution }: ClientDistributionCardProps) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 91, 169, 0.1)',
        border: '2px solid #FFD700',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#005CA9',
          marginBottom: '1rem',
        }}
      >
        Distribuição da Base
      </h3>

      <div style={{ marginBottom: '1.5rem', color: '#718096', fontSize: '0.875rem' }}>
        Total de respostas: <strong style={{ color: '#2D3748' }}>{distribution.totalResponses}</strong>
      </div>

      {/* Gráfico de Barras Horizontal */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Clientes */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2D3748' }}>
              Clientes BB
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFD700' }}>
              {distribution.clientsPercentage}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '32px',
              background: '#E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${distribution.clientsPercentage}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#005CA9',
                fontWeight: 700,
                fontSize: '0.875rem',
                transition: 'width 0.5s ease',
              }}
            >
              {distribution.clients > 0 && distribution.clients}
            </div>
          </div>
        </div>

        {/* Não Clientes */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2D3748' }}>
              Não Clientes
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0066B3' }}>
              {distribution.nonClientsPercentage}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '32px',
              background: '#E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${distribution.nonClientsPercentage}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #0066B3 0%, #005CA9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                transition: 'width 0.5s ease',
              }}
            >
              {distribution.nonClients > 0 && distribution.nonClients}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div
        style={{
          background: '#F7FAFC',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem' }}>
            Clientes
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFD700' }}>
            {distribution.clients}
          </div>
        </div>
        <div
          style={{
            width: '1px',
            background: '#E2E8F0',
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem' }}>
            Não Clientes
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0066B3' }}>
            {distribution.nonClients}
          </div>
        </div>
      </div>
    </div>
  )
}
