const API_BASE_URL = "https://api-rac-n-play.vercel.app/api/data"

class ApiBase {
  async fetchAllData() {
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching data:", error)
      throw error
    }
  }

  // Helper methods to extract specific data
  getPublishedData(dataArray) {
    return dataArray.filter((item) => item.published_at !== null)
  }

  // Get users (up_users)
  getUsers(data) {
    return data.tables?.up_users?.data || []
  }

  // Get events
  getEvents(data) {
    return this.getPublishedData(data.tables?.eventos?.data || [])
  }

  // Get activations
  getActivations(data) {
    return this.getPublishedData(data.tables?.ativacoes?.data || [])
  }

  // Get check-ins
  getCheckins(data) {
    return this.getPublishedData(data.tables?.checkins?.data || [])
  }

  // Get prizes (brindes)
  getPrizes(data) {
    return this.getPublishedData(data.tables?.brindes?.data || [])
  }

  // Get redemptions (resgates)
  getRedemptions(data) {
    return this.getPublishedData(data.tables?.resgates?.data || [])
  }

  // Get surveys
  getSurveys(data) {
    return this.getPublishedData(data.tables?.pesquisa_experiencias?.data || [])
  }

  // Get lucky numbers
  getLuckyNumbers(data) {
    return this.getPublishedData(data.tables?.numero_da_sortes?.data || [])
  }

  // Get coin guesses
  getCoinGuesses(data) {
    return this.getPublishedData(data.tables?.chute_moedas?.data || [])
  }

  // Get clients
  getClients(data) {
    return this.getPublishedData(data.tables?.clientes?.data || [])
  }
}

export default new ApiBase()
