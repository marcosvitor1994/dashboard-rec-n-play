# Componentes do Dashboard

Esta pasta contém os componentes modulares do dashboard Rec'n'Play.

## 🎯 Novo Sistema de Filtros com Offcanvas

O dashboard agora utiliza um sistema moderno de filtros com **offcanvas** (painel lateral deslizante). Os filtros não ficam mais permanentemente visíveis, aparecendo apenas quando necessário.

### Como Funciona:
- **Botões de Filtro nos Cards**: Cada card que possui filtros tem um botão no canto superior direito
- **Offcanvas Deslizante**: Ao clicar no botão, um painel lateral desliza da direita com as opções
- **Indicador Visual**: O botão fica azul quando há filtros ativos
- **Filtros Contextuais**: Cada card pode ter diferentes opções de filtro

### Cards com Filtros:
1. **Check-ins por Dia** → Filtro de Ativação
2. **Distribuição por Faixa Etária** → Filtro de Ativação
3. **Intenção de Relacionamento** → Filtro de Ativação
4. **Picos de Horário** → Filtro de Ativação + Data Específica

## Estrutura de Componentes

### MetricCard.tsx
Componente para exibir métricas individuais com label e valor.

**Props:**
- `label: string` - Título da métrica
- `value: string | number` - Valor da métrica
- `className?: string` - Classes CSS adicionais (opcional)

**Uso:**
```tsx
<MetricCard label="Total de Usuários" value={1234} />
```

---

### LineChartComponent.tsx
Componente de gráfico de linha usando Nivo.

**Props:**
- `data: any[]` - Array de dados
- `xKey?: string` - Chave para eixo X (padrão: "x")
- `yKey?: string` - Chave para eixo Y (padrão: "y")

**Uso:**
```tsx
<LineChartComponent
  data={checkinsPerDay}
  xKey="date"
  yKey="count"
/>
```

---

### BarChartComponent.tsx
Componente de gráfico de barras usando Nivo.

**Props:**
- `data: any[]` - Array de dados
- `indexBy: string` - Chave para indexação
- `keys: string[]` - Chaves dos valores
- `colors?: any` - Esquema de cores (padrão: { scheme: "nivo" })
- `layout?: "vertical" | "horizontal"` - Orientação (padrão: "vertical")

**Uso:**
```tsx
<BarChartComponent
  data={ageDistribution}
  indexBy="age"
  keys={["count"]}
  colors={{ scheme: "paired" }}
  layout="horizontal"
/>
```

---

### ChartCard.tsx
Componente wrapper para gráficos com botão de filtro integrado.

**Props:**
- `title: string` - Título do card
- `subtitle?: string` - Subtítulo opcional (ex: nome da ativação filtrada)
- `children: ReactNode` - Conteúdo do card (geralmente um gráfico)
- `onFilterClick?: () => void` - Callback quando clica no botão de filtro
- `hasActiveFilter?: boolean` - Se há filtro ativo (muda cor do botão)

**Uso:**
```tsx
<ChartCard
  title="Check-ins por Dia"
  subtitle={selectedActivation ? "Nome da Ativação" : undefined}
  onFilterClick={() => setIsFilterOpen(true)}
  hasActiveFilter={!!selectedActivation}
>
  <LineChartComponent data={data} xKey="date" yKey="count" />
</ChartCard>
```

---

### FilterOffcanvas.tsx
Componente de painel lateral deslizante para filtros.

**Props:**
- `isOpen: boolean` - Se o offcanvas está aberto
- `onClose: () => void` - Callback para fechar
- `title: string` - Título do offcanvas
- `showActivationFilter?: boolean` - Mostrar filtro de ativação
- `activations?: Activation[]` - Lista de ativações
- `selectedActivation?: number` - Ativação selecionada
- `onActivationChange?: (id: number | undefined) => void` - Callback de mudança
- `showDateFilter?: boolean` - Mostrar filtro de data
- `availableDates?: string[]` - Lista de datas
- `selectedDate?: string` - Data selecionada
- `onDateChange?: (date: string) => void` - Callback de mudança

**Uso:**
```tsx
<FilterOffcanvas
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Filtrar por Ativação"
  showActivationFilter={true}
  activations={activations}
  selectedActivation={selected}
  onActivationChange={setSelected}
/>
```

---

### SurveyQuestionsSection.tsx
Componente para exibir análise de perguntas da pesquisa.

**Props:**
- `questions: SurveyQuestion[]` - Array de perguntas com médias

**Uso:**
```tsx
<SurveyQuestionsSection questions={surveyQuestions} />
```

---

## Estrutura de Pastas

```
app/
├── components/
│   └── dashboard/
│       ├── MetricCard.tsx              - Card de métricas
│       ├── LineChartComponent.tsx      - Gráfico de linha
│       ├── BarChartComponent.tsx       - Gráfico de barras
│       ├── ChartCard.tsx               - Wrapper com botão de filtro
│       ├── FilterOffcanvas.tsx         - Painel lateral de filtros
│       ├── SurveyQuestionsSection.tsx  - Seção de perguntas
│       └── README.md                   - Esta documentação
├── types/
│   └── dashboard.types.ts              - Interfaces TypeScript
├── utils/
│   └── dashboard.utils.ts              - Funções utilitárias
└── dashboard-page.tsx                   - Página principal
```

## Benefícios da Modularização

1. **Reutilização**: Componentes podem ser usados em outras páginas
2. **Manutenibilidade**: Mais fácil localizar e corrigir bugs
3. **Testabilidade**: Componentes menores são mais fáceis de testar
4. **Legibilidade**: Código mais organizado e fácil de entender
5. **Separação de Responsabilidades**: Cada componente tem uma função específica
