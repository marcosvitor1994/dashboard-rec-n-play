"use client"

import { useEffect, useState } from "react"
import ApiBase from "../service/ApiBase"
import MetricCard from "../components/MetricCard"
import LineChartComponent from "../components/LineChartComponent"
import BarChartComponent from "../components/BarChartComponent"
import {
  processCheckinsPerDay,
  processCheckinsPerActivation,
  processUsersPerDay,
  processAgeDistribution,
  processClientIntention,
  calculateAverageSurveyRating,
  getUniqueUsersWithActivations,
  processActivationsByTime,
} from "../utils/dataProcessors"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCheckins: 0,
    checkinsPerDay: [],
    checkinsPerActivation: [],
    usersPerDay: [],
    ageDistribution: [],
    clientIntention: [],
    averageSurveyRating: 0,
    activationsByTime: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await ApiBase.fetchAllData()

        // Extract data from API response
        const users = ApiBase.getUsers(data)
        const checkins = ApiBase.getCheckins(data)
        const activations = ApiBase.getActivations(data)
        const surveys = ApiBase.getSurveys(data)

        // Get relationship links
        const checkinActivationLinks = data.tables?.checkins_ativacao_lnk?.data || []
        const checkinUserLinks = data.tables?.checkins_users_permissions_user_lnk?.data || []

        // Process data for dashboard
        const processedData = {
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
        <h1 className="dashboard-title">Dashboard Rec'n'Play</h1>
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

export default Dashboard
