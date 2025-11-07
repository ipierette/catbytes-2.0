'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminContextType {
  isAdmin: boolean
  isLoading: boolean
  login: (password: string, email?: string) => Promise<boolean>
  logout: () => void
  supabaseAuthenticated: boolean
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  supabaseAuthenticated: false,
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseAuthenticated, setSupabaseAuthenticated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
    checkSupabaseAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/admin/verify')
      const data = await response.json()
      setIsAdmin(data.authenticated === true)
    } catch {
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function checkSupabaseAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSupabaseAuthenticated(!!session)
    } catch {
      setSupabaseAuthenticated(false)
    }
  }

  async function login(password: string, email?: string): Promise<boolean> {
    try {
      // Email padrão se não fornecido
      const loginEmail = email || 'ipierette2@gmail.com'

      console.log('🔐 [LOGIN] Tentando autenticar...')

      // 1. Login no sistema admin (JWT/Cookie) - Este é o principal
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        console.error('❌ [LOGIN] Falha na autenticação admin')
        return false
      }

      console.log('✅ [LOGIN] Admin autenticado com sucesso')
      setIsAdmin(true)

      // 2. Autenticar no Supabase Auth também (para uploads)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password
        })

        if (!error && data.session) {
          setSupabaseAuthenticated(true)
          console.log('✅ [LOGIN] Autenticado no Supabase Auth:', data.user.email)
        } else {
          console.warn('⚠️ [LOGIN] Admin autenticado, mas falha no Supabase Auth:', error?.message)
          // Ainda permite login admin mesmo se Supabase falhar
          // O upload vai usar SERVICE_ROLE_KEY como fallback
        }
      } catch (supabaseError) {
        console.warn('⚠️ [LOGIN] Erro ao autenticar no Supabase:', supabaseError)
        // Não falha o login por causa disso
      }

      return true
    } catch (error) {
      console.error('❌ [LOGIN] Erro inesperado:', error)
      return false
    }
  }

  function logout() {
    document.cookie = 'admin_token=; Max-Age=0; path=/'
    setIsAdmin(false)
    
    // Logout do Supabase também
    supabase.auth.signOut().catch(console.error)
    setSupabaseAuthenticated(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, login, logout, supabaseAuthenticated }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
