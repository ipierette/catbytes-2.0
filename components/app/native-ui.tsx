// ================================================
// Native Mobile UI Components
// Material Design + iOS Inspired
// ================================================

'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { X, Check, AlertCircle, Info } from 'lucide-react'

// ========== Native Card ==========
interface AppCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function AppCard({ children, className = '', onClick }: AppCardProps) {
  return (
    <motion.div
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={`app-card ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ========== Native Button ==========
interface AppButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  className?: string
  haptic?: 'light' | 'medium' | 'heavy'
}

export function AppButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  haptic = 'medium'
}: AppButtonProps) {
  const handleClick = () => {
    // Trigger vibration if supported
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(patterns[haptic])
    }
    
    onClick?.()
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      disabled={disabled}
      className={`app-button app-button-${variant} app-haptic-${haptic} ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ========== Native Toast ==========
interface AppToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
}

export function AppToast({ message, type = 'info', onClose }: AppToastProps) {
  const icons = {
    success: Check,
    error: X,
    info: Info
  }
  
  const Icon = icons[type]
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="app-toast"
    >
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto">
          <X className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  )
}

// ========== Native Sheet (Bottom Sheet) ==========
interface AppSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function AppSheet({ isOpen, onClose, children, title }: AppSheetProps) {
  if (!isOpen) return null
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) {
            onClose()
          }
        }}
        className="fixed bottom-0 left-0 right-0 z-[2001] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] pb-safe">
          {children}
        </div>
      </motion.div>
    </>
  )
}

// ========== Native List Item ==========
interface AppListItemProps {
  children: ReactNode
  onClick?: () => void
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  subtitle?: string
}

export function AppListItem({
  children,
  onClick,
  leftIcon,
  rightIcon,
  subtitle
}: AppListItemProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="app-list-item app-haptic-light cursor-pointer"
    >
      {leftIcon && (
        <div className="mr-3 text-gray-500 dark:text-gray-400">
          {leftIcon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium text-gray-900 dark:text-white">
          {children}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      
      {rightIcon && (
        <div className="ml-3 text-gray-400 dark:text-gray-500">
          {rightIcon}
        </div>
      )}
    </motion.div>
  )
}

// ========== Native Skeleton Loader ==========
interface AppSkeletonProps {
  width?: string
  height?: string
  className?: string
}

export function AppSkeleton({ width = '100%', height = '20px', className = '' }: AppSkeletonProps) {
  return (
    <div
      className={`app-skeleton ${className}`}
      style={{ width, height }}
    />
  )
}

// ========== Native Section Header ==========
interface AppSectionHeaderProps {
  children: ReactNode
}

export function AppSectionHeader({ children }: AppSectionHeaderProps) {
  return (
    <div className="app-section-header">
      {children}
    </div>
  )
}

// ========== Native Divider ==========
export function AppDivider() {
  return <div className="app-divider" />
}

// ========== Native Chip/Tag ==========
interface AppChipProps {
  children: ReactNode
  color?: 'purple' | 'blue' | 'green' | 'red' | 'gray'
  onClick?: () => void
}

export function AppChip({ children, color = 'purple', onClick }: AppChipProps) {
  const colors = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }
  
  return (
    <motion.span
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${colors[color]} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.span>
  )
}

// ========== Pull to Refresh ==========
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  return (
    <div className="relative">
      <div className="app-pull-to-refresh">
        <div className="app-pull-spinner" />
      </div>
      {children}
    </div>
  )
}
