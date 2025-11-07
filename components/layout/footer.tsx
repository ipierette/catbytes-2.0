'use client'

import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { FaHeart, FaCat, FaLinkedin, FaGithub, FaEnvelope, FaInstagram } from 'react-icons/fa'
import { Lock } from 'lucide-react'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'
import { useAdmin } from '@/hooks/use-admin'

export function Footer() {
  const t = useTranslations('footer')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  const { login, logout, isAdmin } = useAdmin()
  
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

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
        router.push(`/${locale}/admin/blog`)
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

  return (
    <>
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section with Logo */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/catbytes-logo.webp"
                alt="CatBytes"
                width={250}
                height={100}
                className="w-[250px] h-auto"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-comfortaa font-bold mb-4 text-purple-400">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('links.about')}
                </a>
              </li>
              <li>
                <a href="#skills" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('links.skills')}
                </a>
              </li>
              <li>
                <a href="#projects" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('links.projects')}
                </a>
              </li>
              <li>
                <a href="#ai-features" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('links.aiFeatures')}
                </a>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-400 hover:text-purple-400 transition-colors">
                  📝 Blog
                </Link>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('links.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-comfortaa font-bold mb-4 text-purple-400">
              {t('connect')}
            </h3>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/izadora-cury-pierette-7a7754253/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://github.com/ipierette"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://www.instagram.com/catbytes_izadora_pierette/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Instagram"
                title="Siga no Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="mailto:ipierette2@gmail.com"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Email"
              >
                <FaEnvelope size={24} />
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              ipierette2@gmail.com
            </p>
          </div>

          {/* Newsletter Section */}
          <div>
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-400 mb-2">
            © 2025 Izadora Cury Pierette. {t('rights')}.
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            {t('madeWith')} <FaHeart className="text-red-500" /> {t('and')} <FaCat className="text-green-400" />
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <p className="text-xs text-gray-600">
              CatBytes v2.0 | {t('accessibility')}
            </p>
            {/* Admin Access Button */}
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-gray-600 hover:text-purple-400 transition-colors opacity-50 hover:opacity-100"
              aria-label="Admin Login"
              title="Admin Access"
            >
              <Lock size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>

    {/* Admin Login Modal - Rendered outside footer using Portal */}
    {mounted && showAdminModal && createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title-footer"
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
            <h2 id="admin-modal-title-footer" className="text-2xl font-comfortaa font-bold text-gray-900 dark:text-white">
              Admin Access
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isAdmin ? 'Você já está logado como admin' : 'Digite a senha para acessar o painel admin'}
            </p>
          </div>

          {!isAdmin ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-password-footer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  id="admin-password-footer"
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
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          ) : (
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
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                📊 Ir para Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🚪 Sair (Logout)
              </button>
              <button
                onClick={() => setShowAdminModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    )}
  </>
  )
}
