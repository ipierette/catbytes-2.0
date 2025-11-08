'use client'
import { FaUser, FaCat } from 'react-icons/fa'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Code, Laptop, Coffee, BookOpen, Sparkles } from 'lucide-react'
import { CatBytesStoryModal } from './catbytes-story-modal'

export function About() {
  const t = useTranslations('about')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [showCatBytesStory, setShowCatBytesStory] = useState(false)

  const skills = [
    { icon: Code, label: t('skills.programming'), color: 'text-green-500' },
    { icon: Laptop, label: t('skills.webDevelopment'), color: 'text-blue-500' },
    { icon: Coffee, label: t('skills.coffeeAndCreativity'), color: 'text-orange-500' },
    { icon: BookOpen, label: t('skills.continuousLearning'), color: 'text-purple-500' },
  ]

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 px-4 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-comfortaa font-bold text-center mb-12 flex items-center justify-center gap-3"
        >
          <span className="text-blue-600 dark:text-green-400">{t('title')}</span>
          <FaCat className="text-orange-500 dark:text-orange-400" />
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <Image
              src="/images/izadora.webp"
              alt="Izadora Cury Pierette"
              width={500}
              height={500}
              className="rounded-2xl shadow-2xl mx-auto border-4 border-catbytes-green"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {t('intro')}
            </p>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {t('description')}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              {skills.map((skill, index) => {
                const Icon = skill.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="flex flex-col items-center gap-2"
                    title={skill.label}
                  >
                    <Icon className={`w-10 h-10 ${skill.color}`} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Sobre o CatBytes - História do Nome */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12 border-2 border-purple-200 dark:border-purple-700"
        >
          <h3 className="text-3xl md:text-4xl font-comfortaa font-bold text-center mb-8 flex items-center justify-center gap-3">
            <FaCat className="text-orange-500 dark:text-orange-400" />
            <span className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent">
              {t('about.catbytes.title')}
            </span>
          </h3>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
              className="space-y-4"
            >
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {t('about.catbytes.paragraph1')}
              </p>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {t('about.catbytes.paragraph2')}
              </p>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {t('about.catbytes.paragraph3')}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-catbytes-purple">
                <p className="text-base italic text-gray-600 dark:text-gray-400">
                  &quot;{t('about.catbytes.quote')}&quot;
                </p>
              </div>
              
              {/* Botão para abrir modal */}
              <motion.button
                onClick={() => setShowCatBytesStory(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-pink text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                {t('catbytes.buttonText')}
                <FaCat className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative"
            >
              <Image
                src="/images/axel-adulto.webp"
                alt={t('about.catbytes.imageAlt')}
                width={500}
                height={500}
                className="rounded-2xl shadow-2xl mx-auto border-4 border-orange-400 dark:border-orange-500"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 bg-gradient-to-r from-catbytes-purple to-catbytes-pink text-white px-6 py-3 rounded-full shadow-lg font-bold"
              >
                {t('about.catbytes.badge')}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Modal da História do CatBytes */}
      <CatBytesStoryModal 
        isOpen={showCatBytesStory} 
        onClose={() => setShowCatBytesStory(false)} 
      />
    </section>
  )
}
