'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaHeart, FaCat, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

export function Footer() {
  const t = useTranslations('footer')
  const params = useParams()
  const locale = params.locale as string

  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section with Logo */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/catbytes-logo.png"
                alt="CatBytes"
                width={250}
                height={100}
                className="w-auto h-16"
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
          <p className="text-xs text-gray-600 mt-4">
            CatBytes v2.0 | {t('accessibility')}
          </p>
        </div>
      </div>
    </footer>
  )
}
