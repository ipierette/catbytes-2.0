'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, Lock } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageToggle } from './language-toggle'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { useAdmin } from '@/hooks/use-admin'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { login, logout, isAdmin } = useAdmin()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Login com senha apenas (email padrão será usado)
      const success = await login(password)
      if (success) {
        setShowAdminModal(false)
        setPassword('')
        router.push('/admin/dashboard')
      } else {
        setError('Senha incorreta')
      }
    } catch {
      setError('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowAdminModal(false)
    router.push('/')
  }

  // Check if we're on the home page
  const isHomePage = pathname === `/${locale}` || pathname === '/'

  const navItems = [
    { href: isHomePage ? '#hero' : `/${locale}#hero`, label: t('home') },
    { href: isHomePage ? '#about' : `/${locale}#about`, label: t('about') },
    { href: isHomePage ? '#skills' : `/${locale}#skills`, label: t('skills') },
    { href: isHomePage ? '#projects' : `/${locale}#projects`, label: t('projects') },
    { href: isHomePage ? '#curiosities' : `/${locale}#curiosities`, label: t('curiosities') },
    { href: isHomePage ? '#ai-features' : `/${locale}#ai-features`, label: t('aiFeatures') },
    { href: isHomePage ? '#blog' : `/${locale}#blog`, label: 'Blog' },
    { href: isHomePage ? '#contact' : `/${locale}#contact`, label: t('contact') },
  ]

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md shadow-lg"
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="CatBytes">
            <Image
              src="/images/logo-desenvolvedora.webp"
              alt="Logo CatBytes"
              width={180}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-white hover:text-catbytes-purple transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}

            {/* Admin Access Button - Discreto */}
            <button
              onClick={() => setShowAdminModal(true)}
              className="p-2 rounded-full bg-gray-700/50 text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition-all duration-300"
              aria-label="Admin Access"
              title="Admin Access"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              aria-label={t('themeToggle')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Toggle */}
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-700 text-white"
              aria-label={t('themeToggle')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-4 mt-4 pb-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-catbytes-purple transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4">
                  <LanguageToggle />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>

    {/* Admin Login Modal - Rendered outside header using Portal */}
    {mounted && showAdminModal && createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
        >
          <button
            onClick={() => {
              setShowAdminModal(false)
              setPassword('')
              setError('')
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 id="admin-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Access
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isAdmin ? 'Você já está logado como admin' : 'Digite a senha para acessar o painel admin'}
            </p>
          </div>

          {isAdmin ? (
            <div className="space-y-3">
              <div className="text-center text-green-600 dark:text-green-400 mb-4 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Autenticado como admin
              </div>
              <button
                onClick={() => {
                  setShowAdminModal(false)
                  router.push('/admin/dashboard')
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                📊 Ir para Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                🚪 Sair (Logout)
              </button>
              <button
                onClick={() => setShowAdminModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>,
      document.body
    )}
  </>
  )
}
