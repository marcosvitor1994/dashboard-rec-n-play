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
  processSatisfactionBlocks,
  processComments,
  getAvailableDates,
  getPublishedData,
  getUniqueUsersWithActivations,
} from "./utils/dashboard.utils"
import MetricCard from "./components/dashboard/MetricCard"
import LineChartComponent from "./components/dashboard/LineChartComponent"
import BarChartComponent from "./components/dashboard/BarChartComponent"
import ChartCard from "./components/dashboard/ChartCard"
import FilterOffcanvas from "./components/dashboard/FilterOffcanvas"
import SurveyQuestionsSection from "./components/dashboard/SurveyQuestionsSection"
import CommentsCard from "./components/dashboard/CommentsCard"

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
    satisfactionBlocks: [],
    comments: [],
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

  // Estado para controlar o offcanvas de filtro global
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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
        const resgatesBrindeLinks = data.tables?.resgates_brinde_lnk?.data || []
        const checkinActivationLinks = data.tables?.checkins_ativacao_lnk?.data || []
        const checkinUserLinks = data.tables?.checkins_users_permissions_user_lnk?.data || []
        const avaliacaoAtivacoes = getPublishedData(data.tables?.avaliacao_de_ativacaos?.data || [])
        const avaliacaoAtivacaoLinks = data.tables?.avaliacao_de_ativacaos_ativacao_lnk?.data || []

        setRawData({
          checkins,
          checkinActivationLinks,
          surveys,
        })

        const surveyQuestions = processSurveyQuestions(surveys)
        const satisfactionBlocks = processSatisfactionBlocks(surveyQuestions)

        const processedData: DashboardData = {
          totalUsers: getUniqueUsersWithActivations(checkinUserLinks),
          totalCheckins: checkins.length,
          totalResgates: resgatesBrindeLinks.length,
          checkinsPerDay: processCheckinsPerDay(checkins),
          checkinsPerActivation: processCheckinsPerActivation(checkins, activations, checkinActivationLinks, avaliacaoAtivacoes, avaliacaoAtivacaoLinks),
          usersPerDay: processUsersPerDay(users),
          ageDistribution: processAgeDistribution(surveys),
          clientIntention: processClientIntention(surveys),
          averageSurveyRating: calculateAverageSurveyRating(surveys),
          activationsByTime: processActivationsByTimeWithFilters(checkins, checkinActivationLinks),
          surveyQuestions,
          satisfactionBlocks,
          comments: processComments(surveys),
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
    <div style={{
      padding: "2rem",
      backgroundColor: "#E8F4F8",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative elements */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        height: "350px",
        backgroundImage: "url(/cacto.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        opacity: 0.6,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div style={{
        position: "fixed",
        top: "20px",
        right: "50px",
        width: "150px",
        height: "150px",
        backgroundImage: "url(/passarinho.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            width: "80px",
            height: "80px",
            backgroundImage: "url(/MissãoBB.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            flexShrink: 0
          }} />
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#005CA9", marginBottom: "0.5rem", margin: 0 }}>Dashboard Rec'n'Play</h1>
            <p style={{ fontSize: "1rem", color: "#0066B3", margin: 0 }}>Banco do Brasil - Análise de Eventos e Ativações</p>
          </div>
        </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <MetricCard label="Usuários com Ativações" value={dashboardData.totalUsers} backgroundImage="/passarinho.png" />
        <MetricCard label="Total de Check-ins" value={dashboardData.totalCheckins} />
        <MetricCard label="Total de Resgates" value={dashboardData.totalResgates} backgroundImage="/cacto.png" />
        <MetricCard label="Ativações Disponíveis" value={dashboardData.checkinsPerActivation.length} />
        <div style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(255, 165, 0, 0.3)", color: "#1a202c", border: "2px solid #FFD700" }}>
          <div style={{ fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 600, color: "#005CA9" }}>Nota Média das Pesquisas</div>
          <div style={{ fontSize: "3rem", fontWeight: 700, color: "#005CA9" }}>{dashboardData.averageSurveyRating}</div>
        </div>
      </div>

      {/* Filtro Global */}
      <FilterOffcanvas
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros Globais"
        showActivationFilter={true}
        activations={dashboardData.activations}
        selectedActivation={selectedActivation}
        onActivationChange={setSelectedActivation}
        showDateFilter={true}
        availableDates={dashboardData.availableDates}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Botão para abrir o filtro global */}
      <button
        onClick={() => setIsFilterOpen(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#005CA9",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 998,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 8px rgba(0, 91, 169, 0.2)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 2H1.5L6.5 8.088V12.5L9.5 14V8.088L14.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {(selectedActivation || selectedDate) ? "Filtros Ativos" : "Filtrar"}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Check-ins por Dia - COM FILTRO - GRÁFICO DE BARRAS */}
        <ChartCard
          title="Check-ins por Dia"
          subtitle={selectedActivation ? dashboardData.activations.find(a => a.id === selectedActivation)?.nome : undefined}
          onFilterClick={() => setIsFilterOpen(true)}
          hasActiveFilter={!!(selectedActivation || selectedDate)}
        >
          <BarChartComponent
            data={filteredCheckinsPerDay}
            indexBy="date"
            keys={["count"]}
            colors={["#0066B3"]}
            labelTextColor="#ffffff"
          />
        </ChartCard>

        {/* Check-ins por Ativação - SEM FILTRO */}
        <ChartCard title="Check-ins por Ativação">
          <BarChartComponent
            data={dashboardData.checkinsPerActivation}
            indexBy="name"
            keys={["count"]}
            colors={["#FFD700"]}
            layout="horizontal"
            tooltip={({ data }) => (
              <div
                style={{
                  background: "white",
                  padding: "12px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "8px", color: "#2d3748" }}>
                  {data.name}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#4a5568", marginBottom: "4px" }}>
                  Check-ins: <strong>{data.count}</strong>
                </div>
                {data.avgRating !== undefined && (
                  <>
                    <div style={{ fontSize: "0.875rem", color: "#4a5568", marginBottom: "4px" }}>
                      Avaliação Média: <strong>{data.avgRating}</strong>/5
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                      Total de Avaliações: {data.totalRatings}
                    </div>
                  </>
                )}
                {data.avgRating === undefined && (
                  <div style={{ fontSize: "0.875rem", color: "#a0aec0", fontStyle: "italic" }}>
                    Sem avaliações disponíveis
                  </div>
                )}
              </div>
            )}
          />
        </ChartCard>

        {/* Faixa Etária - SEM FILTRO (dados gerais da pesquisa de experiência) */}
        <ChartCard
          title="Distribuição por Faixa Etária"
        >
          <BarChartComponent
            data={filteredAgeDistribution}
            indexBy="age"
            keys={["count"]}
            colors={["#00CED1"]}
            layout="horizontal"
            axisLeftFormat={(value) => Math.floor(value)}
          />
        </ChartCard>

        {/* Intenção de Relacionamento - SEM FILTRO (dados gerais da pesquisa de experiência) */}
        <ChartCard
          title="Intenção de Relacionamento - Média das Notas"
          subtitle="Clientes vs Não Clientes"
        >
          <BarChartComponent
            data={filteredClientIntention}
            indexBy="type"
            keys={["count"]}
            colors={["#FF6B9D"]}
            layout="horizontal"
          />
        </ChartCard>

        
      </div>

      {/* Seção de gráficos grandes - 2 colunas de 50% cada */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Usuários Cadastrados - SEM FILTRO - GRÁFICO DE BARRAS */}
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0, 91, 169, 0.1)", border: "1px solid #E8F4F8" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#005CA9", marginBottom: "1rem" }}>Usuários Cadastrados por Dia</h2>
          <div style={{ height: "400px" }}>
            <BarChartComponent
              data={dashboardData.usersPerDay}
              indexBy="date"
              keys={["count"]}
              colors={["#9B59B6"]}
              labelTextColor="#ffffff"
            />
          </div>
        </div>

        {/* Picos de Horário - COM FILTRO DUPLO (Ativação + Data) - GRÁFICO DE LINHAS */}
        <ChartCard
          title="Picos de Horário das Ativações"
          subtitle={
            selectedActivation || selectedDate
              ? `${selectedActivation ? dashboardData.activations.find(a => a.id === selectedActivation)?.nome || '' : ''}${selectedActivation && selectedDate ? ' - ' : ''}${selectedDate || ''}${!selectedDate && !selectedActivation ? '' : ''}`
              : "(Média de todos os dias)"
          }
          onFilterClick={() => setIsFilterOpen(true)}
          hasActiveFilter={!!(selectedActivation || selectedDate)}
        >
          <LineChartComponent
            data={filteredActivationsByTime}
            xKey="time"
            yKey="count"
          />
        </ChartCard>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <SurveyQuestionsSection blocks={dashboardData.satisfactionBlocks} />

      {/* Card de Comentários */}
      <div style={{ marginTop: "2rem" }}>
        <CommentsCard comments={dashboardData.comments} />
      </div>
      </div>
    </div>
  )
}