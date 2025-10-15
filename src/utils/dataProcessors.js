export const processCheckinsPerDay = (checkins) => {
  const checkinsPerDay = {}

  checkins.forEach((checkin) => {
    const date = new Date(checkin.created_at).toLocaleDateString("pt-BR")
    checkinsPerDay[date] = (checkinsPerDay[date] || 0) + 1
  })

  return Object.entries(checkinsPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export const processCheckinsPerActivation = (checkins, activations, checkinActivationLinks) => {
  const activationMap = {}

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

export const processUsersPerDay = (users) => {
  const usersPerDay = {}

  users.forEach((user) => {
    const date = new Date(user.created_at).toLocaleDateString("pt-BR")
    usersPerDay[date] = (usersPerDay[date] || 0) + 1
  })

  return Object.entries(usersPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export const processAgeDistribution = (surveys) => {
  const ageGroups = {}

  surveys.forEach((survey) => {
    const ageQuestion = survey.pergunta_resposta?.find((item) => item.pergunta?.includes("idade"))

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

export const processClientIntention = (surveys) => {
  const intentions = {
    Cliente: 0,
    "Não Cliente": 0,
  }

  surveys.forEach((survey) => {
    const clientQuestion = survey.pergunta_resposta?.find((item) => item.pergunta?.includes("Cliente BB"))

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

export const calculateAverageSurveyRating = (surveys) => {
  if (surveys.length === 0) return 0

  let totalRating = 0
  let ratingCount = 0

  surveys.forEach((survey) => {
    const experienceQuestion = survey.pergunta_resposta?.find((item) =>
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

  return ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0
}

export const getUniqueUsersWithActivations = (checkinUserLinks) => {
  const uniqueUsers = new Set(checkinUserLinks.map((link) => link.user_id))
  return uniqueUsers.size
}

export const processActivationsByTime = (checkins) => {
  const timeSlots = {}

  checkins.forEach((checkin) => {
    const hour = new Date(checkin.created_at).getHours()
    const timeSlot = `${hour}:00`
    timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1
  })

  return Object.entries(timeSlots)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time))
}
