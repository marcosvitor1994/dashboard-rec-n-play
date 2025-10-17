export interface CheckinPerDay {
  date: string
  count: number
}

export interface CheckinPerActivation {
  name: string
  count: number
  avgRating?: number
  totalRatings?: number
}

export interface UserPerDay {
  date: string
  count: number
}

export interface AgeDistribution {
  age: string
  count: number
}

export interface ClientIntention {
  type: string
  count: number
}

export interface ActivationByTime {
  time: string
  count: number
}

export interface SurveyQuestion {
  pergunta: string
  media: number
  totalRespostas: number
  grau: number // (média - 1) / 4 * 100
}

export interface SatisfactionBlock {
  title: string
  type: 'satisfaction' | 'positioning' | 'relationship'
  questions: SurveyQuestion[]
  averageScore: number // Nota média
  grade: number // Grau (%)
  variation?: number // Variação em relação a períodos anteriores (positivo/negativo)
}

export interface Comment {
  id: number
  comment: string
  date: string
  age?: string
  isClient?: string
}

export interface Activation {
  id: number
  nome: string
}

export interface DashboardData {
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
  satisfactionBlocks: SatisfactionBlock[]
  comments: Comment[]
  activations: Activation[]
  availableDates: string[]
}
