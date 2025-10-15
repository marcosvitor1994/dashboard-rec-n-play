"use client"

import { useEffect, useState } from "react"
import { ResponsiveLine } from "@nivo/line"
import { ResponsiveBar } from "@nivo/bar"

const API_BASE_URL = "https://api-rac-n-play.vercel.app/api/data/all"

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

interface SurveyQuestion {
  pergunta: string
  media: number
  totalRespostas: number
}

interface Activation {
  id: number
  nome: string
}

interface DashboardData {
  totalUsers: number
  totalCheckins: number
  totalResgates: number
  checkinsPerDay: CheckinPerDay[]
  checkinsPerActivation: CheckinPerActivation[]
  usersPerDay: UserPerDay[]
  ageDistribution: AgeDistribution[]
  clientIntention: ClientIntention[]
  averageSurveyRating: string
  activationsByTime: ActivationByTime[]
  surveyQuestions: SurveyQuestion[]
  activations: Activation[]
  availableDates: string[]
}

const processCheckinsPerDay = (checkins: any[], activationId?: number, checkinActivationLinks?: any[]): CheckinPerDay[] => {
  let filteredCheckins = checkins
  
  if (activationId && checkinActivationLinks) {
    const checkinIds = checkinActivationLinks
      .filter((link) => link.ativacao_id === activationId)
      .map((link) => link.checkin_id)
    filteredCheckins = checkins.filter((checkin) => checkinIds.includes(checkin.id))
  }

  const checkinsPerDay: Record<string, number> = {}
  filteredCheckins.forEach((checkin) => {
    const date = new Date(checkin.created_at).toLocaleDateString("pt-BR")
    checkinsPerDay[date] = (checkinsPerDay[date] || 0) + 1
  })

  return Object.entries(checkinsPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
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

const processAgeDistribution = (surveys: any[], activationId?: number, checkinActivationLinks?: any[]): AgeDistribution[] => {
  let filteredSurveys = surveys
  
  if (activationId && checkinActivationLinks) {
    const checkinIds = checkinActivationLinks
      .filter((link) => link.ativacao_id === activationId)
      .map((link) => link.checkin_id)
    filteredSurveys = surveys.filter((survey) => checkinIds.includes(survey.checkin_id))
  }

  const ageGroups: Record<string, number> = {}

  filteredSurveys.forEach((survey) => {
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

const processClientIntention = (surveys: any[], activationId?: number, checkinActivationLinks?: any[]): ClientIntention[] => {
  let filteredSurveys = surveys
  
  if (activationId && checkinActivationLinks) {
    const checkinIds = checkinActivationLinks
      .filter((link) => link.ativacao_id === activationId)
      .map((link) => link.checkin_id)
    filteredSurveys = surveys.filter((survey) => checkinIds.includes(survey.checkin_id))
  }

  const intentionCounts: Record<string, number> = {}
  
  filteredSurveys.forEach((survey) => {
    const intentionQuestion = survey.pergunta_resposta?.find((item: any) => 
      item.pergunta?.toLowerCase().includes("intenção") || 
      item.pergunta?.toLowerCase().includes("intencao") ||
      item.pergunta?.toLowerCase().includes("relacionamento")
    )

    if (intentionQuestion?.resposta) {
      const response = intentionQuestion.resposta
      const match = response.match(/^(\d+)/)
      if (match) {
        const value = parseInt(match[1])
        if (value >= 4) {
          intentionCounts["Top 2 Box (Positivo)"] = (intentionCounts["Top 2 Box (Positivo)"] || 0) + 1
        } else {
          intentionCounts["Outros"] = (intentionCounts["Outros"] || 0) + 1
        }
      }
    }
  })

  return Object.entries(intentionCounts).map(([type, count]) => ({
    type,
    count,
  }))
}

const processActivationsByTimeWithFilters = (
  checkins: any[],
  checkinActivationLinks: any[],
  activationId?: number,
  selectedDate?: string,
): ActivationByTime[] => {
  let filteredCheckins = checkins

  if (activationId) {
    const checkinIds = checkinActivationLinks
      .filter((link) => link.ativacao_id === activationId)
      .map((link) => link.checkin_id)
    filteredCheckins = filteredCheckins.filter((checkin) => checkinIds.includes(checkin.id))
  }

  if (selectedDate) {
    filteredCheckins = filteredCheckins.filter((checkin) => {
      const checkinDate = new Date(checkin.created_at).toLocaleDateString("pt-BR")
      return checkinDate === selectedDate
    })
  }

  const timeSlots: Record<string, number> = {}

  filteredCheckins.forEach((checkin) => {
    const hour = new Date(checkin.created_at).getHours()
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`
    timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1
  })

  return Object.entries(timeSlots)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => parseInt(a.time) - parseInt(b.time))
}

const getAvailableDates = (checkins: any[]): string[] => {
  const dates = new Set<string>()
  checkins.forEach((checkin) => {
    const date = new Date(checkin.created_at).toLocaleDateString("pt-BR")
    dates.add(date)
  })
  return Array.from(dates).sort((a, b) => 
    new Date(a.split('/').reverse().join('-')).getTime() - 
    new Date(b.split('/').reverse().join('-')).getTime()
  )
}

const getPublishedData = (dataArray: any[]) => {
  return dataArray.filter((item) => item.published_at !== null)
}

const getUniqueUsersWithActivations = (checkinUserLinks: any[]): number => {
  const uniqueUsers = new Set(checkinUserLinks.map((link) => link.user_id))
  return uniqueUsers.size
}

const processUsersPerDay = (users: any[]): UserPerDay[] => {
  const usersPerDay: Record<string, number> = {}

  users.forEach((user) => {
    const date = new Date(user.created_at).toLocaleDateString("pt-BR")
    usersPerDay[date] = (usersPerDay[date] || 0) + 1
  })

  return Object.entries(usersPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
}

const calculateAverageSurveyRating = (surveys: any[]): string => {
  if (surveys.length === 0) return "0"

  let totalRating = 0
  let ratingCount = 0

  surveys.forEach((survey) => {
    const experienceQuestion = survey.pergunta_resposta?.find((item: any) =>
      item.pergunta?.includes("experiência no espaço") || item.pergunta?.includes("experiencia no espaco"),
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

const processSurveyQuestions = (surveys: any[]): SurveyQuestion[] => {
  const questionsMap: Record<string, { total: number; count: number }> = {}

  surveys.forEach((survey) => {
    if (survey.pergunta_resposta && Array.isArray(survey.pergunta_resposta)) {
      survey.pergunta_resposta.forEach((item: any) => {
        if (item.pergunta && item.resposta) {
          const pergunta = item.pergunta
          const resposta = item.resposta
          const match = resposta.match(/^(\d+)/)
          if (match) {
            const valor = parseInt(match[1])
            if (!questionsMap[pergunta]) {
              questionsMap[pergunta] = { total: 0, count: 0 }
            }
            questionsMap[pergunta].total += valor
            questionsMap[pergunta].count += 1
          }
        }
      })
    }
  })

  return Object.entries(questionsMap)
    .map(([pergunta, { total, count }]) => ({
      pergunta,
      media: count > 0 ? Number((total / count).toFixed(2)) : 0,
      totalRespostas: count,
    }))
    .filter((item) => item.totalRespostas > 0)
}

const MetricCard = ({
  label,
  value,
  className = "",
}: { label: string; value: string | number; className?: string }) => {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s, box-shadow 0.2s" }} className={className}>
      <div style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "0.5rem", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2d3748" }}>{value}</div>
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
      margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
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
  layout = "vertical"
}: { data: any[]; indexBy: string; keys: string[]; colors?: any; layout?: "vertical" | "horizontal" }) => {
  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      layout={layout}
      margin={{ top: 20, right: 20, bottom: layout === "horizontal" ? 60 : 120, left: layout === "horizontal" ? 180 : 60 }}
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
        tickRotation: layout === "horizontal" ? 0 : -45,
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
        legendOffset: layout === "horizontal" ? -160 : -50,
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
    totalResgates: 0,
    checkinsPerDay: [],
    checkinsPerActivation: [],
    usersPerDay: [],
    ageDistribution: [],
    clientIntention: [],
    averageSurveyRating: "0",
    activationsByTime: [],
    surveyQuestions: [],
    activations: [],
    availableDates: [],
  })

  const [selectedActivation, setSelectedActivation] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<string>("")
  
  const [filteredCheckinsPerDay, setFilteredCheckinsPerDay] = useState<CheckinPerDay[]>([])
  const [filteredAgeDistribution, setFilteredAgeDistribution] = useState<AgeDistribution[]>([])
  const [filteredClientIntention, setFilteredClientIntention] = useState<ClientIntention[]>([])
  const [filteredActivationsByTime, setFilteredActivationsByTime] = useState<ActivationByTime[]>([])

  const [rawData, setRawData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_BASE_URL)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const users = data.tables?.up_users?.data || []
        const checkins = getPublishedData(data.tables?.checkins?.data || [])
        const activations = getPublishedData(data.tables?.ativacoes?.data || [])
        const surveys = getPublishedData(data.tables?.pesquisa_experiencias?.data || [])
        const resgates = getPublishedData(data.tables?.resgates?.data || [])
        const checkinActivationLinks = data.tables?.checkins_ativacao_lnk?.data || []
        const checkinUserLinks = data.tables?.checkins_users_permissions_user_lnk?.data || []

        setRawData({
          checkins,
          checkinActivationLinks,
          surveys,
        })

        const processedData: DashboardData = {
          totalUsers: getUniqueUsersWithActivations(checkinUserLinks),
          totalCheckins: checkins.length,
          totalResgates: resgates.length,
          checkinsPerDay: processCheckinsPerDay(checkins),
          checkinsPerActivation: processCheckinsPerActivation(checkins, activations, checkinActivationLinks),
          usersPerDay: processUsersPerDay(users),
          ageDistribution: processAgeDistribution(surveys),
          clientIntention: processClientIntention(surveys),
          averageSurveyRating: calculateAverageSurveyRating(surveys),
          activationsByTime: processActivationsByTimeWithFilters(checkins, checkinActivationLinks),
          surveyQuestions: processSurveyQuestions(surveys),
          activations: activations.map((a: any) => ({ id: a.id, nome: a.nome })),
          availableDates: getAvailableDates(checkins),
        }

        setDashboardData(processedData)
        setFilteredCheckinsPerDay(processedData.checkinsPerDay)
        setFilteredAgeDistribution(processedData.ageDistribution)
        setFilteredClientIntention(processedData.clientIntention)
        setFilteredActivationsByTime(processedData.activationsByTime)
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

  useEffect(() => {
    if (!rawData) return

    setFilteredCheckinsPerDay(
      processCheckinsPerDay(rawData.checkins, selectedActivation, rawData.checkinActivationLinks)
    )
    
    setFilteredAgeDistribution(
      processAgeDistribution(rawData.surveys, selectedActivation, rawData.checkinActivationLinks)
    )
    
    setFilteredClientIntention(
      processClientIntention(rawData.surveys, selectedActivation, rawData.checkinActivationLinks)
    )
    
    setFilteredActivationsByTime(
      processActivationsByTimeWithFilters(
        rawData.checkins,
        rawData.checkinActivationLinks,
        selectedActivation,
        selectedDate
      )
    )
  }, [selectedActivation, selectedDate, rawData])

  if (loading) {
    return (
      <div style={{ padding: "2rem", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <div style={{ border: "4px solid #e2e8f0", borderTop: "4px solid #3182ce", borderRadius: "50%", width: "50px", height: "50px", animation: "spin 1s linear infinite" }}></div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
        <div style={{ backgroundColor: "#fed7d7", border: "1px solid #fc8181", borderRadius: "8px", padding: "1rem", margin: "2rem 0", color: "#c53030" }}>
          <strong>Erro:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a202c", marginBottom: "0.5rem" }}>Dashboard Rec'n'Play</h1>
        <p style={{ fontSize: "1rem", color: "#718096" }}>Banco do Brasil - Análise de Eventos e Ativações</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <MetricCard label="Usuários com Ativações" value={dashboardData.totalUsers} />
        <MetricCard label="Total de Check-ins" value={dashboardData.totalCheckins} />
        <MetricCard label="Total de Resgates" value={dashboardData.totalResgates} />
        <MetricCard label="Ativações Disponíveis" value={dashboardData.checkinsPerActivation.length} />
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", color: "white" }}>
          <div style={{ fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500, color: "rgba(255, 255, 255, 0.9)" }}>Nota Média das Pesquisas</div>
          <div style={{ fontSize: "3rem", fontWeight: 700 }}>{dashboardData.averageSurveyRating}</div>
        </div>
      </div>

      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: 600 }}>Filtros</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              Ativação <span style={{ fontSize: "0.8rem", color: "#666" }}>(afeta Check-ins, Faixa Etária, Intenção e Horários)</span>
            </label>
            <select
              value={selectedActivation || ""}
              onChange={(e) => setSelectedActivation(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">Todas as ativações</option>
              {dashboardData.activations.map((activation) => (
                <option key={activation.id} value={activation.id}>
                  {activation.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
              Data Específica <span style={{ fontSize: "0.8rem", color: "#666" }}>(afeta Picos de Horário)</span>
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">Todas as datas (média)</option>
              {dashboardData.availableDates.map((date) => (
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
              onClick={() => {
                setSelectedActivation(undefined)
                setSelectedDate("")
              }}
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>
            Check-ins por Dia {selectedActivation && `- ${dashboardData.activations.find(a => a.id === selectedActivation)?.nome}`}
          </h2>
          <div style={{ height: "300px" }}>
            <LineChartComponent data={filteredCheckinsPerDay} xKey="date" yKey="count" />
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>Check-ins por Ativação</h2>
          <div style={{ height: "300px" }}>
            <BarChartComponent
              data={dashboardData.checkinsPerActivation}
              indexBy="name"
              keys={["count"]}
              colors={{ scheme: "set2" }}
              layout="horizontal"
            />
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>
            Distribuição por Faixa Etária {selectedActivation && `- ${dashboardData.activations.find(a => a.id === selectedActivation)?.nome}`}
          </h2>
          <div style={{ height: "300px" }}>
            <BarChartComponent
              data={filteredAgeDistribution}
              indexBy="age"
              keys={["count"]}
              colors={{ scheme: "paired" }}
              layout="horizontal"
            />
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>
            Intenção de Relacionamento (Top 2 Box) {selectedActivation && `- ${dashboardData.activations.find(a => a.id === selectedActivation)?.nome}`}
          </h2>
          <div style={{ height: "300px" }}>
            <BarChartComponent
              data={filteredClientIntention}
              indexBy="type"
              keys={["count"]}
              colors={{ scheme: "accent" }}
            />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>Usuários Cadastrados por Dia</h2>
          <div style={{ height: "400px" }}>
            <LineChartComponent data={dashboardData.usersPerDay} xKey="date" yKey="count" />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>
            Picos de Horário das Ativações
            {selectedActivation && ` - ${dashboardData.activations.find(a => a.id === selectedActivation)?.nome}`}
            {selectedDate && ` - ${selectedDate}`}
            {!selectedDate && " (Média de todos os dias)"}
          </h2>
          <div style={{ height: "400px" }}>
            <BarChartComponent
              data={filteredActivationsByTime}
              indexBy="time"
              keys={["count"]}
              colors={{ scheme: "category10" }}
            />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#2d3748", marginBottom: "1rem" }}>Análise de Perguntas da Pesquisa de Experiências</h2>
          <div style={{ padding: "1rem" }}>
            {dashboardData.surveyQuestions.length > 0 ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                {dashboardData.surveyQuestions.map((question, index) => (
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
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}