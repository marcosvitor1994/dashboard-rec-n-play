"use client"

import { useEffect, useState } from "react"
import { ResponsiveLine } from "@nivo/line"
import { ResponsiveBar } from "@nivo/bar"
import "./dashboard.css"

const API_BASE_URL = "https://api-rac-n-play.vercel.app/api/data"

interface CheckinPerDay {
  date: string
  count: number
}

interface CheckinPerActivation {
  name: string
  count: number
}

interface UserPerDay {
  date: string
  count: number
}

interface AgeDistribution {
  age: string
  count: number
}

interface ClientIntention {
  type: string
  count: number
}

interface ActivationByTime {
  time: string
  count: number
}

interface DashboardData {
  totalUsers: number
  totalCheckins: number
  checkinsPerDay: CheckinPerDay[]
  checkinsPerActivation: CheckinPerActivation[]
  usersPerDay: UserPerDay[]
  ageDistribution: AgeDistribution[]
  clientIntention: ClientIntention[]
  averageSurveyRating: string
  activationsByTime: ActivationByTime[]
}

// Utility functions
const processCheckinsPerDay = (checkins: any[]): CheckinPerDay[] => {
  const checkinsPerDay: Record<string, number> = {}

  checkins.forEach((checkin) => {
    const date = new Date(checkin.created_at).toLocaleDateString("pt-BR")
    checkinsPerDay[date] = (checkinsPerDay[date] || 0) + 1
  })

  return Object.entries(checkinsPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const processCheckinsPerActivation = (
  checkins: any[],
  activations: any[],
  checkinActivationLinks: any[],
): CheckinPerActivation[] => {
  const activationMap: Record<number, { name: string; count: number }> = {}

  activations.forEach((activation) => {
    activationMap[activation.id] = {
      name: activation.nome,
      count: 0,
    }
  })

  checkinActivationLinks.forEach((link) => {
    const activation = activationMap[link.ativacao_id]
    if (activation) {
      activation.count += 1
    }
  })

  return Object.values(activationMap)
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
}

const processUsersPerDay = (users: any[]): UserPerDay[] => {
  const usersPerDay: Record<string, number> = {}

  users.forEach((user) => {
    const date = new Date(user.created_at).toLocaleDateString("pt-BR")
    usersPerDay[date] = (usersPerDay[date] || 0) + 1
  })

  return Object.entries(usersPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const processAgeDistribution = (surveys: any[]): AgeDistribution[] => {
  const ageGroups: Record<string, number> = {}

  surveys.forEach((survey) => {
    const ageQuestion = survey.pergunta_resposta?.find((item: any) => item.pergunta?.includes("idade"))

    if (ageQuestion?.resposta) {
      const age = ageQuestion.resposta
      ageGroups[age] = (ageGroups[age] || 0) + 1
    }
  })

  return Object.entries(ageGroups).map(([age, count]) => ({
    age,
    count,
  }))
}

const processClientIntention = (surveys: any[]): ClientIntention[] => {
  const intentions: Record<string, number> = {
    Cliente: 0,
    "Não Cliente": 0,
  }

  surveys.forEach((survey) => {
    const clientQuestion = survey.pergunta_resposta?.find((item: any) => item.pergunta?.includes("Cliente BB"))

    if (clientQuestion?.resposta === "Sim") {
      intentions["Cliente"] += 1
    } else if (clientQuestion?.resposta === "Não") {
      intentions["Não Cliente"] += 1
    }
  })

  return Object.entries(intentions).map(([type, count]) => ({
    type,
    count,
  }))
}

const calculateAverageSurveyRating = (surveys: any[]): string => {
  if (surveys.length === 0) return "0"

  let totalRating = 0
  let ratingCount = 0

  surveys.forEach((survey) => {
    const experienceQuestion = survey.pergunta_resposta?.find((item: any) =>
      item.pergunta?.includes("experiência no espaço"),
    )

    if (experienceQuestion?.resposta) {
      const rating = Number.parseInt(experienceQuestion.resposta.charAt(0))
      if (!isNaN(rating)) {
        totalRating += rating
        ratingCount += 1
      }
    }
  })

  return ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : "0"
}

const getUniqueUsersWithActivations = (checkinUserLinks: any[]): number => {
  const uniqueUsers = new Set(checkinUserLinks.map((link) => link.user_id))
  return uniqueUsers.size
}

const processActivationsByTime = (checkins: any[]): ActivationByTime[] => {
  const timeSlots: Record<string, number> = {}

  checkins.forEach((checkin) => {
    const hour = new Date(checkin.created_at).getHours()
    const timeSlot = `${hour}:00`
    timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1
  })

  return Object.entries(timeSlots)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time))
}

const getPublishedData = (dataArray: any[]) => {
  return dataArray.filter((item) => item.published_at !== null)
}

// Components
const MetricCard = ({
  label,
  value,
  className = "",
}: { label: string; value: string | number; className?: string }) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  )
}

const LineChartComponent = ({ data, xKey = "x", yKey = "y" }: { data: any[]; xKey?: string; yKey?: string }) => {
  const formattedData = [
    {
      id: "data",
      data: data.map((item) => ({
        x: item[xKey],
        y: item[yKey],
      })),
    },
  ]

  return (
    <ResponsiveLine
      data={formattedData}
      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: "",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Quantidade",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      colors={{ scheme: "category10" }}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableArea={true}
      areaOpacity={0.1}
      legends={[]}
    />
  )
}

const BarChartComponent = ({
  data,
  indexBy,
  keys,
  colors = { scheme: "nivo" },
}: { data: any[]; indexBy: string; keys: string[]; colors?: any }) => {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={colors}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: "",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Quantidade",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={[]}
      role="application"
      ariaLabel="Bar chart"
    />
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalCheckins: 0,
    checkinsPerDay: [],
    checkinsPerActivation: [],
    usersPerDay: [],
    ageDistribution: [],
    clientIntention: [],
    averageSurveyRating: "0",
    activationsByTime: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/all`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Extract data from API response
        const users = data.tables?.up_users?.data || []
        const checkins = getPublishedData(data.tables?.checkins?.data || [])
        const activations = getPublishedData(data.tables?.ativacoes?.data || [])
        const surveys = getPublishedData(data.tables?.pesquisa_experiencias?.data || [])

        // Get relationship links
        const checkinActivationLinks = data.tables?.checkins_ativacao_lnk?.data || []
        const checkinUserLinks = data.tables?.checkins_users_permissions_user_lnk?.data || []

        // Process data for dashboard
        const processedData: DashboardData = {
          totalUsers: getUniqueUsersWithActivations(checkinUserLinks),
          totalCheckins: checkins.length,
          checkinsPerDay: processCheckinsPerDay(checkins),
          checkinsPerActivation: processCheckinsPerActivation(checkins, activations, checkinActivationLinks),
          usersPerDay: processUsersPerDay(users),
          ageDistribution: processAgeDistribution(surveys),
          clientIntention: processClientIntention(surveys),
          averageSurveyRating: calculateAverageSurveyRating(surveys),
          activationsByTime: processActivationsByTime(checkins),
        }

        setDashboardData(processedData)
        setError(null)
      } catch (err) {
        setError("Erro ao carregar dados do dashboard. Por favor, tente novamente.")
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Rec&apos;n&apos;Play</h1>
        <p className="dashboard-subtitle">Banco do Brasil - Análise de Eventos e Ativações</p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard label="Usuários com Ativações" value={dashboardData.totalUsers} />
        <MetricCard label="Total de Check-ins" value={dashboardData.totalCheckins} />
        <MetricCard label="Ativações Disponíveis" value={dashboardData.checkinsPerActivation.length} />
        <MetricCard
          label="Nota Média das Pesquisas"
          value={dashboardData.averageSurveyRating}
          className="survey-rating-card"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Check-ins per Day */}
        <div className="chart-card">
          <h2 className="chart-title">Check-ins por Dia</h2>
          <div className="chart-container">
            <LineChartComponent data={dashboardData.checkinsPerDay} xKey="date" yKey="count" />
          </div>
        </div>

        {/* Check-ins per Activation */}
        <div className="chart-card">
          <h2 className="chart-title">Check-ins por Ativação</h2>
          <div className="chart-container">
            <BarChartComponent
              data={dashboardData.checkinsPerActivation}
              indexBy="name"
              keys={["count"]}
              colors={{ scheme: "set2" }}
            />
          </div>
        </div>

        {/* Users per Day */}
        <div className="chart-card full-width-chart">
          <h2 className="chart-title">Usuários Cadastrados por Dia</h2>
          <div className="chart-container">
            <LineChartComponent data={dashboardData.usersPerDay} xKey="date" yKey="count" />
          </div>
        </div>

        {/* Age Distribution */}
        <div className="chart-card">
          <h2 className="chart-title">Distribuição por Faixa Etária</h2>
          <div className="chart-container">
            <BarChartComponent
              data={dashboardData.ageDistribution}
              indexBy="age"
              keys={["count"]}
              colors={{ scheme: "paired" }}
            />
          </div>
        </div>

        {/* Client Intention */}
        <div className="chart-card">
          <h2 className="chart-title">Intenção de Relacionamento (Clientes vs Não Clientes)</h2>
          <div className="chart-container">
            <BarChartComponent
              data={dashboardData.clientIntention}
              indexBy="type"
              keys={["count"]}
              colors={{ scheme: "accent" }}
            />
          </div>
        </div>

        {/* Activations by Time */}
        <div className="chart-card full-width-chart">
          <h2 className="chart-title">Picos de Horário das Ativações</h2>
          <div className="chart-container">
            <BarChartComponent
              data={dashboardData.activationsByTime}
              indexBy="time"
              keys={["count"]}
              colors={{ scheme: "category10" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}