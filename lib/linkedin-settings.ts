/**
 * LinkedIn Settings - Gerenciamento de configurações e tokens
 * Similar ao instagram-settings.ts
 */

import { supabaseAdmin } from './supabase'

export interface LinkedInSettings {
  id: string
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  person_urn: string | null
  organization_urn: string | null
  last_token_refresh: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Obtém as configurações ativas do LinkedIn
 */
export async function getLinkedInSettings(): Promise<LinkedInSettings | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('linkedin_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('[LinkedIn Settings] Error fetching settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[LinkedIn Settings] Unexpected error:', error)
    return null
  }
}

/**
 * Atualiza o access token do LinkedIn
 */
export async function updateLinkedInToken(
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number
): Promise<boolean> {
  try {
    const settings = await getLinkedInSettings()
    
    if (!settings) {
      console.error('[LinkedIn Settings] No active settings found')
      return false
    }

    const updates: any = {
      access_token: accessToken,
      last_token_refresh: new Date().toISOString(),
    }

    if (refreshToken) {
      updates.refresh_token = refreshToken
    }

    if (expiresIn) {
      const expiresAt = new Date(Date.now() + expiresIn * 1000)
      updates.token_expires_at = expiresAt.toISOString()
    }

    const { error } = await supabaseAdmin
      .from('linkedin_settings')
      .update(updates)
      .eq('id', settings.id)

    if (error) {
      console.error('[LinkedIn Settings] Error updating token:', error)
      return false
    }

    console.log('[LinkedIn Settings] ✅ Token updated successfully')
    return true
  } catch (error) {
    console.error('[LinkedIn Settings] Unexpected error updating token:', error)
    return false
  }
}

/**
 * Atualiza URNs do LinkedIn (person e organization)
 */
export async function updateLinkedInUrns(
  personUrn?: string,
  organizationUrn?: string
): Promise<boolean> {
  try {
    const settings = await getLinkedInSettings()
    
    if (!settings) {
      console.error('[LinkedIn Settings] No active settings found')
      return false
    }

    const updates: any = {}

    if (personUrn) {
      updates.person_urn = personUrn
    }

    if (organizationUrn) {
      updates.organization_urn = organizationUrn
    }

    if (Object.keys(updates).length === 0) {
      return true // Nada para atualizar
    }

    const { error } = await supabaseAdmin
      .from('linkedin_settings')
      .update(updates)
      .eq('id', settings.id)

    if (error) {
      console.error('[LinkedIn Settings] Error updating URNs:', error)
      return false
    }

    console.log('[LinkedIn Settings] ✅ URNs updated successfully')
    return true
  } catch (error) {
    console.error('[LinkedIn Settings] Unexpected error updating URNs:', error)
    return false
  }
}

/**
 * Verifica se o token está expirado
 */
export async function isLinkedInTokenExpired(): Promise<boolean> {
  try {
    const settings = await getLinkedInSettings()
    
    if (!settings || !settings.token_expires_at) {
      return true
    }

    const now = new Date()
    const expiresAt = new Date(settings.token_expires_at)
    
    // Considera expirado se faltar menos de 7 dias
    const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysUntilExpiry < 7) {
      console.warn(`[LinkedIn Settings] ⚠️ Token expiring in ${Math.floor(daysUntilExpiry)} days`)
      return true
    }

    return false
  } catch (error) {
    console.error('[LinkedIn Settings] Error checking token expiration:', error)
    return true
  }
}

/**
 * Obtém access token válido (renova se necessário)
 */
export async function getValidLinkedInAccessToken(): Promise<string | null> {
  try {
    const settings = await getLinkedInSettings()
    
    if (!settings || settings.access_token === 'PENDING_OAUTH') {
      console.error('[LinkedIn Settings] OAuth not completed yet')
      return null
    }

    const isExpired = await isLinkedInTokenExpired()
    
    if (isExpired && settings.refresh_token) {
      console.log('[LinkedIn Settings] Token expired, refreshing...')
      // Aqui você implementaria a lógica de refresh
      // Por enquanto, retorna null para forçar re-autenticação
      return null
    }

    return settings.access_token
  } catch (error) {
    console.error('[LinkedIn Settings] Error getting valid token:', error)
    return null
  }
}

/**
 * Cria ou atualiza configuração completa do LinkedIn
 */
export async function saveLinkedInSettings(data: {
  access_token: string
  refresh_token: string
  expires_in: number
  person_urn?: string
  organization_urn?: string
}): Promise<boolean> {
  try {
    const settings = await getLinkedInSettings()
    
    const expiresAt = new Date(Date.now() + data.expires_in * 1000)

    if (settings) {
      // Atualizar existente
      const { error } = await supabaseAdmin
        .from('linkedin_settings')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          person_urn: data.person_urn || settings.person_urn,
          organization_urn: data.organization_urn || settings.organization_urn,
          last_token_refresh: new Date().toISOString(),
        })
        .eq('id', settings.id)

      if (error) throw error
    } else {
      // Criar novo
      const { error } = await supabaseAdmin
        .from('linkedin_settings')
        .insert({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          person_urn: data.person_urn,
          organization_urn: data.organization_urn,
          is_active: true,
        })

      if (error) throw error
    }

    console.log('[LinkedIn Settings] ✅ Settings saved successfully')
    return true
  } catch (error) {
    console.error('[LinkedIn Settings] Error saving settings:', error)
    return false
  }
}
