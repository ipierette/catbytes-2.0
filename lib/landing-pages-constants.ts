// =====================================================
// Landing Pages Constants
// =====================================================

export const NICHES = [
  { value: 'consultorio', label: 'Consultório Médico/Odontológico', emoji: '🏥' },
  { value: 'advocacia', label: 'Escritório de Advocacia', emoji: '⚖️' },
  { value: 'contabilidade', label: 'Contabilidade', emoji: '📊' },
  { value: 'imobiliaria', label: 'Imobiliária', emoji: '🏘️' },
  { value: 'restaurante', label: 'Restaurante/Delivery', emoji: '🍔' },
  { value: 'academia', label: 'Academia/Personal', emoji: '💪' },
  { value: 'beleza', label: 'Salão de Beleza/Estética', emoji: '💇' },
  { value: 'oficina', label: 'Oficina Mecânica', emoji: '🔧' },
  { value: 'marketing', label: 'Agência de Marketing', emoji: '📱' },
  { value: 'escola', label: 'Escola/Curso Online', emoji: '📚' },
  { value: 'petshop', label: 'Pet Shop/Veterinária', emoji: '🐾' },
  { value: 'outros', label: 'Outros Negócios', emoji: '🚀' },
] as const

export const COLOR_THEMES_ARRAY = [
  { value: 'blue', label: 'Azul Profissional', primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
  { value: 'green', label: 'Verde Crescimento', primary: '#11998e', secondary: '#38ef7d', accent: '#4facfe' },
  { value: 'orange', label: 'Laranja Energia', primary: '#f12711', secondary: '#f5af19', accent: '#fbc2eb' },
  { value: 'purple', label: 'Roxo Inovação', primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
  { value: 'pink', label: 'Rosa Moderno', primary: '#ee0979', secondary: '#ff6a00', accent: '#fbc2eb' },
  { value: 'teal', label: 'Turquesa Saúde', primary: '#0575e6', secondary: '#00f2fe', accent: '#43e97b' },
] as const

export const COLOR_THEMES = {
  blue: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
  green: { primary: '#11998e', secondary: '#38ef7d', accent: '#4facfe' },
  orange: { primary: '#f12711', secondary: '#f5af19', accent: '#fbc2eb' },
  purple: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
  pink: { primary: '#ee0979', secondary: '#ff6a00', accent: '#fbc2eb' },
  teal: { primary: '#0575e6', secondary: '#00f2fe', accent: '#43e97b' },
} as const

export type NicheValue = typeof NICHES[number]['value']
export type ThemeColor = keyof typeof COLOR_THEMES
