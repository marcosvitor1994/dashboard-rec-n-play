import type {
  CheckinPerDay,
  CheckinPerActivation,
  AgeDistribution,
  ClientIntention,
  ClientDistribution,
  ActivationByTime,
  UserPerDay,
  SurveyQuestion,
  SatisfactionBlock,
} from "../types/dashboard.types"

export const processCheckinsPerDay = (checkins: any[], activationId?: number, checkinActivationLinks?: any[]): CheckinPerDay[] => {
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

export const processCheckinsPerActivation = (
  checkins: any[],
  activations: any[],
  checkinActivationLinks: any[],
  avaliacaoAtivacoes?: any[],
  avaliacaoAtivacaoLinks?: any[],
): CheckinPerActivation[] => {
  const activationMap: Record<number, { name: string; count: number; totalRating: number; ratingCount: number }> = {}

  activations.forEach((activation) => {
    activationMap[activation.id] = {
      name: activation.nome,
      count: 0,
      totalRating: 0,
      ratingCount: 0,
    }
  })

  checkinActivationLinks.forEach((link) => {
    const activation = activationMap[link.ativacao_id]
    if (activation) {
      activation.count += 1
    }
  })

  // Calcular média de avaliação por ativação usando a tabela avaliacao_de_ativacaos
  if (avaliacaoAtivacoes && avaliacaoAtivacaoLinks) {
    avaliacaoAtivacoes.forEach((avaliacao) => {
      // Encontrar as ativações vinculadas a esta avaliação
      const links = avaliacaoAtivacaoLinks.filter(link => link.avaliacao_de_ativacao_id === avaliacao.id)

      links.forEach(link => {
        const activation = activationMap[link.ativacao_id]
        if (activation && avaliacao.avaliacao) {
          // Converter a avaliação para número
          const rating = parseInt(avaliacao.avaliacao)
          if (!isNaN(rating)) {
            activation.totalRating += rating
            activation.ratingCount += 1
          }
        }
      })
    })
  }

  return Object.values(activationMap)
    .filter((item) => item.count > 0)
    .map(item => ({
      name: item.name,
      count: item.count,
      avgRating: item.ratingCount > 0 ? Number((item.totalRating / item.ratingCount).toFixed(2)) : undefined,
      totalRatings: item.ratingCount > 0 ? item.ratingCount : undefined,
    }))
    .sort((a, b) => b.count - a.count)
}

export const processAgeDistribution = (surveys: any[], activationId?: number, checkinActivationLinks?: any[]): AgeDistribution[] => {
  // Pesquisas de experiência são gerais do evento, não por ativação
  // Por isso ignoramos o filtro de ativação
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

export const processClientIntention = (surveys: any[], activationId?: number, checkinActivationLinks?: any[]): ClientIntention[] => {
  // Pesquisas de experiência são gerais do evento, não por ativação
  // Por isso ignoramos o filtro de ativação
  const intentionData: Record<string, { total: number; count: number }> = {
    "Não Clientes": { total: 0, count: 0 },
    "Clientes": { total: 0, count: 0 }
  }

  surveys.forEach((survey) => {
    if (survey.pergunta_resposta && Array.isArray(survey.pergunta_resposta)) {
      survey.pergunta_resposta.forEach((item: any) => {
        if (item.pergunta && item.resposta) {
          const pergunta = item.pergunta.toLowerCase()
          const match = item.resposta.match(/^(\d+)/)

          if (match) {
            const valor = parseInt(match[1])

            // Pergunta para NÃO clientes (vontade de se tornar cliente)
            if (pergunta.includes("vontade de se tornar cliente")) {
              intentionData["Não Clientes"].total += valor
              intentionData["Não Clientes"].count += 1
            }
            // Pergunta para CLIENTES (vontade de ampliar relacionamento)
            else if (pergunta.includes("ampliar seu relacionamento") || pergunta.includes("ampliar o relacionamento")) {
              intentionData["Clientes"].total += valor
              intentionData["Clientes"].count += 1
            }
          }
        }
      })
    }
  })

  // Retornar médias calculadas
  return Object.entries(intentionData)
    .filter(([_, data]) => data.count > 0) // Apenas categorias com respostas
    .map(([type, data]) => ({
      type,
      count: Number((data.total / data.count).toFixed(2)), // Média em vez de contagem
    }))
}

export const processClientDistribution = (surveys: any[]): ClientDistribution => {
  let clients = 0
  let nonClients = 0

  surveys.forEach((survey) => {
    if (survey.pergunta_resposta && Array.isArray(survey.pergunta_resposta)) {
      const clientQuestion = survey.pergunta_resposta.find((item: any) =>
        item.pergunta?.toLowerCase().includes("você é cliente bb") ||
        item.pergunta?.toLowerCase().includes("voce e cliente bb") ||
        item.pergunta?.toLowerCase().includes("cliente do banco do brasil")
      )

      if (clientQuestion?.resposta) {
        const resposta = clientQuestion.resposta.toLowerCase()
        if (resposta.includes("sim") || resposta === "1 - sim") {
          clients += 1
        } else if (resposta.includes("não") || resposta.includes("nao") || resposta === "2 - não") {
          nonClients += 1
        }
      }
    }
  })

  const totalResponses = clients + nonClients
  const clientsPercentage = totalResponses > 0 ? (clients / totalResponses) * 100 : 0
  const nonClientsPercentage = totalResponses > 0 ? (nonClients / totalResponses) * 100 : 0

  return {
    totalResponses,
    clients,
    nonClients,
    clientsPercentage: Number(clientsPercentage.toFixed(2)),
    nonClientsPercentage: Number(nonClientsPercentage.toFixed(2)),
  }
}

export const processActivationsByTimeWithFilters = (
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

export const getAvailableDates = (checkins: any[]): string[] => {
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

export const getPublishedData = (dataArray: any[]) => {
  return dataArray.filter((item) => item.published_at !== null)
}

export const getUniqueUsersWithActivations = (checkinUserLinks: any[]): number => {
  const uniqueUsers = new Set(checkinUserLinks.map((link) => link.user_id))
  return uniqueUsers.size
}

export const processUsersPerDay = (users: any[]): UserPerDay[] => {
  const usersPerDay: Record<string, number> = {}

  users.forEach((user) => {
    const date = new Date(user.created_at).toLocaleDateString("pt-BR")
    usersPerDay[date] = (usersPerDay[date] || 0) + 1
  })

  return Object.entries(usersPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
}

export const calculateAverageSurveyRating = (surveys: any[]): string => {
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

export const processSurveyQuestions = (surveys: any[]): SurveyQuestion[] => {
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
    .map(([pergunta, { total, count }]) => {
      const media = count > 0 ? Number((total / count).toFixed(2)) : 0
      const grau = ((media - 1) / 4) * 100
      return {
        pergunta,
        media,
        totalRespostas: count,
        grau: Number(grau.toFixed(2)),
      }
    })
    .filter((item) => item.totalRespostas > 0)
    .filter((item) => !item.pergunta.toLowerCase().includes("idade"))
}

export const processSatisfactionBlocks = (questions: SurveyQuestion[]): SatisfactionBlock[] => {
  const blocks: SatisfactionBlock[] = []

  // Identificar perguntas por padrões
  const q1 = questions.find(q =>
    q.pergunta.toLowerCase().includes("interesse") ||
    q.pergunta.toLowerCase().includes("assunto")
  )
  const q2 = questions.find(q =>
    q.pergunta.toLowerCase().includes("relevante") ||
    q.pergunta.toLowerCase().includes("relevância")
  )
  const q3 = questions.find(q =>
    q.pergunta.toLowerCase().includes("experiência no espaço") ||
    q.pergunta.toLowerCase().includes("experiencia no espaco")
  )
  const q4 = questions.find(q =>
    q.pergunta.toLowerCase().includes("traços de personalidade") &&
    q.pergunta.toLowerCase().includes("não cliente")
  )
  const q5 = questions.find(q =>
    q.pergunta.toLowerCase().includes("traços de personalidade") &&
    q.pergunta.toLowerCase().includes("cliente")
  )
  const q6 = questions.find(q =>
    q.pergunta.toLowerCase().includes("vontade de se tornar cliente")
  )
  const q7 = questions.find(q =>
    q.pergunta.toLowerCase().includes("ampliar") &&
    q.pergunta.toLowerCase().includes("relacionamento")
  )

  // Bloco de Satisfação (Perguntas 1, 2 e 3)
  if (q1 && q2 && q3) {
    const satisfactionQuestions = [q1, q2, q3]
    // Fórmula: (Grau 1 + Grau 2 + 3 × Grau 3) ÷ 5
    const grade = (q1.grau + q2.grau + (3 * q3.grau)) / 5
    const averageScore = (q1.media + q2.media + q3.media) / 3

    blocks.push({
      title: 'Bloco de Satisfação',
      type: 'satisfaction',
      questions: satisfactionQuestions,
      averageScore: Number(averageScore.toFixed(2)),
      grade: Number(grade.toFixed(2)),
    })
  }

  // Bloco de Posicionamento (Perguntas 4 e 5)
  if (q4 && q5) {
    const positioningQuestions = [q4, q5]
    // Fórmula: (Grau 4 + Grau 5) ÷ 2
    const grade = (q4.grau + q5.grau) / 2
    const averageScore = (q4.media + q5.media) / 2

    blocks.push({
      title: 'Bloco de Posicionamento',
      type: 'positioning',
      questions: positioningQuestions,
      averageScore: Number(averageScore.toFixed(2)),
      grade: Number(grade.toFixed(2)),
    })
  }

  // Bloco de Intenção de Relacionamento (Perguntas 6 e 7)
  if (q6 && q7) {
    const relationshipQuestions = [q6, q7]
    // Para este bloco, usamos a porcentagem de notas 4 e 5
    // Como simplificação, vamos usar o grau médio das duas perguntas
    const grade = (q6.grau + q7.grau) / 2
    const averageScore = (q6.media + q7.media) / 2

    blocks.push({
      title: 'Bloco de Intenção de Relacionamento',
      type: 'relationship',
      questions: relationshipQuestions,
      averageScore: Number(averageScore.toFixed(2)),
      grade: Number(grade.toFixed(2)),
    })
  }

  return blocks
}

export const processComments = (surveys: any[]): { id: number; comment: string; date: string; age?: string; isClient?: string }[] => {
  const comments: { id: number; comment: string; date: string; age?: string; isClient?: string }[] = []

  surveys.forEach((survey) => {
    if (survey.pergunta_resposta && Array.isArray(survey.pergunta_resposta)) {
      // Extrair informações de idade e se é cliente
      let age: string | undefined
      let isClient: string | undefined

      survey.pergunta_resposta.forEach((item: any) => {
        if (item.pergunta?.toLowerCase().includes("idade") && item.resposta) {
          age = item.resposta
        }
        if (item.pergunta?.toLowerCase().includes("cliente bb") && item.resposta) {
          isClient = item.resposta
        }
      })

      // Buscar comentários
      survey.pergunta_resposta.forEach((item: any) => {
        if (item.comentario && item.comentario.trim() !== "") {
          comments.push({
            id: survey.id,
            comment: item.comentario,
            date: survey.created_at || survey.updated_at,
            age: age,
            isClient: isClient,
          })
        }
      })
    }
  })

  // Ordenar por data mais recente primeiro
  return comments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
