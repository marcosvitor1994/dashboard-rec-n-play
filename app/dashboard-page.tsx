"use client"

import { useEffect, useState } from "react"
import type {
  DashboardData,
  CheckinPerDay,
  AgeDistribution,
  ClientIntention,
  ActivationByTime,
} from "./types/dashboard.types"
import {
  processCheckinsPerDay,
  processCheckinsPerActivation,
  processUsersPerDay,
  processAgeDistribution,
  processClientIntention,
  calculateAverageSurveyRating,
  processActivationsByTimeWithFilters,
  processSurveyQuestions,
  getAvailableDates,
  getPublishedData,
  getUniqueUsersWithActivations,
} from "./utils/dashboard.utils"
import MetricCard from "./components/dashboard/MetricCard"
import LineChartComponent from "./components/dashboard/LineChartComponent"
import BarChartComponent from "./components/dashboard/BarChartComponent"
import DashboardFilters from "./components/dashboard/DashboardFilters"
import SurveyQuestionsSection from "./components/dashboard/SurveyQuestionsSection"

const API_BASE_URL = "https://api-rac-n-play.vercel.app/api/data/all"

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

      <DashboardFilters
        activations={dashboardData.activations}
        availableDates={dashboardData.availableDates}
        selectedActivation={selectedActivation}
        selectedDate={selectedDate}
        onActivationChange={setSelectedActivation}
        onDateChange={setSelectedDate}
        onClearFilters={() => {
          setSelectedActivation(undefined)
          setSelectedDate("")
        }}
      />

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

        <SurveyQuestionsSection questions={dashboardData.surveyQuestions} />
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