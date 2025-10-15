# Componentes do Dashboard

Esta pasta contém os componentes modulares do dashboard Rec'n'Play.

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

### DashboardFilters.tsx
Componente de filtros do dashboard.

**Props:**
- `activations: Activation[]` - Lista de ativações
- `availableDates: string[]` - Lista de datas disponíveis
- `selectedActivation: number | undefined` - Ativação selecionada
- `selectedDate: string` - Data selecionada
- `onActivationChange: (id: number | undefined) => void` - Callback para mudança de ativação
- `onDateChange: (date: string) => void` - Callback para mudança de data
- `onClearFilters: () => void` - Callback para limpar filtros

**Uso:**
```tsx
<DashboardFilters
  activations={activations}
  availableDates={dates}
  selectedActivation={selectedId}
  selectedDate={date}
  onActivationChange={setSelectedActivation}
  onDateChange={setSelectedDate}
  onClearFilters={() => { /* limpar */ }}
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
│       ├── MetricCard.tsx
│       ├── LineChartComponent.tsx
│       ├── BarChartComponent.tsx
│       ├── DashboardFilters.tsx
│       ├── SurveyQuestionsSection.tsx
│       └── README.md
├── types/
│   └── dashboard.types.ts
├── utils/
│   └── dashboard.utils.ts
└── dashboard-page.tsx
```

## Benefícios da Modularização

1. **Reutilização**: Componentes podem ser usados em outras páginas
2. **Manutenibilidade**: Mais fácil localizar e corrigir bugs
3. **Testabilidade**: Componentes menores são mais fáceis de testar
4. **Legibilidade**: Código mais organizado e fácil de entender
5. **Separação de Responsabilidades**: Cada componente tem uma função específica
