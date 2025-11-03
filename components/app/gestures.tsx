// ================================================
// Native Mobile Gestures
// Pull-to-Refresh, Swipe Navigation, Haptic Feedback
// ================================================

'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

// ========== Haptic Feedback Helper ==========
export const haptic = {
  light: () => {
    if ('vibrate' in navigator) navigator.vibrate(10)
  },
  medium: () => {
    if ('vibrate' in navigator) navigator.vibrate(20)
  },
  heavy: () => {
    if ('vibrate' in navigator) navigator.vibrate(30)
  },
  success: () => {
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10])
  },
  error: () => {
    if ('vibrate' in navigator) navigator.vibrate([20, 50])
  }
}

// ========== Pull to Refresh ==========
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const y = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Rotate spinner based on pull distance
  const rotate = useTransform(y, [0, threshold], [0, 360])
  const opacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1])

  const handleDragStart = () => {
    // Only allow pull-to-refresh if at top of page
    if (window.scrollY === 0) {
      setIsPulling(true)
      haptic.light()
    }
  }

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsPulling(false)
    
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true)
      haptic.success()
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        y.set(0)
      }
    } else {
      y.set(0)
    }
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull Indicator */}
      <motion.div
        style={{ 
          opacity,
          y: isPulling || isRefreshing ? y : 0
        }}
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 pointer-events-none z-50"
      >
        <motion.div
          style={{ rotate }}
          className={`w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  )
}

// ========== Swipeable Card ==========
interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  swipeThreshold?: number
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100
}: SwipeableCardProps) {
  const x = useMotionValue(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // Background colors for swipe actions
  const leftBg = useTransform(
    x,
    [-swipeThreshold, 0],
    ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0)']
  )
  
  const rightBg = useTransform(
    x,
    [0, swipeThreshold],
    ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.8)']
  )

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsSwiping(false)
    
    if (info.offset.x < -swipeThreshold && onSwipeLeft) {
      haptic.medium()
      onSwipeLeft()
    } else if (info.offset.x > swipeThreshold && onSwipeRight) {
      haptic.medium()
      onSwipeRight()
    }
    
    x.set(0)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Left Action Background (Red) */}
      <motion.div
        style={{ backgroundColor: leftBg }}
        className="absolute inset-0 flex items-center justify-end pr-6"
      >
        <span className="text-white font-semibold text-lg">Delete</span>
      </motion.div>

      {/* Right Action Background (Green) */}
      <motion.div
        style={{ backgroundColor: rightBg }}
        className="absolute inset-0 flex items-center justify-start pl-6"
      >
        <span className="text-white font-semibold text-lg">Archive</span>
      </motion.div>

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragStart={() => setIsSwiping(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-white dark:bg-gray-800"
      >
        {children}
      </motion.div>
    </div>
  )
}

// ========== Long Press ==========
interface LongPressProps {
  onLongPress: () => void
  children: ReactNode
  delay?: number
}

export function LongPress({ onLongPress, children, delay = 500 }: LongPressProps) {
  const timerRef = useRef<NodeJS.Timeout>()
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = () => {
    setIsPressed(true)
    haptic.light()
    
    timerRef.current = setTimeout(() => {
      haptic.heavy()
      onLongPress()
      setIsPressed(false)
    }, delay)
  }

  const handleEnd = () => {
    setIsPressed(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

// ========== Swipe to Go Back ==========
interface SwipeToGoBackProps {
  onGoBack: () => void
  children: ReactNode
  threshold?: number
}

export function SwipeToGoBack({
  onGoBack,
  children,
  threshold = 100
}: SwipeToGoBackProps) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [0, threshold], [0, 1])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > threshold) {
      haptic.medium()
      onGoBack()
    } else {
      x.set(0)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Back Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-50"
      >
        <svg
          className="w-6 h-6 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-purple-500 font-medium">Back</span>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ========== Double Tap to Like ==========
interface DoubleTapProps {
  onDoubleTap: () => void
  children: ReactNode
}

export function DoubleTap({ onDoubleTap, children }: DoubleTapProps) {
  const lastTapRef = useRef(0)
  const [showHeart, setShowHeart] = useState(false)

  const handleTap = () => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      haptic.success()
      onDoubleTap()
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 1000)
    }

    lastTapRef.current = now
  }

  return (
    <div className="relative" onClick={handleTap}>
      {children}
      
      {/* Heart Animation */}
      {showHeart && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <svg
            className="w-24 h-24 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
