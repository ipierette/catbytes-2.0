/**
 * Mapeamento de categorias para exibição consistente
 * 
 * Algumas categorias antigas no banco de dados precisam ser renomeadas
 * para manter consistência visual sem alterar o banco de dados
 */

export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  'Novidades sobre IA': 'Tech Aleatório',
  'AI News': 'Random Tech',
}

/**
 * Retorna o nome de exibição da categoria
 * Se não houver mapeamento, retorna o nome original
 */
export function getCategoryDisplayName(category: string): string {
  return CATEGORY_DISPLAY_MAP[category] || category
}

/**
 * Retorna o nome da categoria no banco de dados
 * Reverso do mapeamento de exibição
 */
export function getCategoryDatabaseName(displayName: string): string {
  const entry = Object.entries(CATEGORY_DISPLAY_MAP).find(
    ([_, display]) => display === displayName
  )
  return entry ? entry[0] : displayName
}
