'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AdminContextType {
  isAdmin: boolean
  isLoading: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
})

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
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

  async function login(password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAdmin(true)
        return true
      }

      return false
    } catch {
      return false
    }
  }

  function logout() {
    document.cookie = 'admin_token=; Max-Age=0; path=/'
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
