"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Announcement {
  title: string
  message: string
  startTime: string
  endTime: string
}

const mockAnnouncements: Announcement[] = [
  {
    title: "Welcome to BookBazzar!",
    message: "Discover your next favorite read. New users get 20% off their first purchase!",
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() + 604800000).toISOString(),
  },
  {
    title: "Summer Reading Challenge",
    message: "Join our reading challenge and win exciting prizes! Register now on your profile.",
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() + 2592000000).toISOString(),
  },
  {
    title: "New Releases This Week",
    message: "Check out our latest arrivals from top authors. Limited time offers available!",
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() + 1209600000).toISOString(),
  },
]

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [autoplay, setAutoplay] = useState(true)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch("https://localhost:7265/api/Announcement/GetActiveBanners", {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error("Failed to fetch announcements")
        }

        const data = await response.json()

        const now = new Date()
        const activeAnnouncements = Array.isArray(data)
          ? data.filter((announcement: Announcement) => {
              const startTime = new Date(announcement.startTime)
              const endTime = new Date(announcement.endTime)
              return now >= startTime && now <= endTime
            })
          : []

        if (activeAnnouncements.length === 0) {
          setAnnouncements(mockAnnouncements)
        } else {
          setAnnouncements(activeAnnouncements)
        }
      } catch (err) {
        // Silently fall back to mock announcements if API fails
        setAnnouncements(mockAnnouncements)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (autoplay && announcements.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex === announcements.length - 1 ? 0 : prevIndex + 1))
      }, 5000)
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [autoplay, announcements.length])

  const handleMouseEnter = () => setAutoplay(false)
  const handleMouseLeave = () => setAutoplay(true)

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === announcements.length - 1 ? 0 : prevIndex + 1))
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? announcements.length - 1 : prevIndex - 1))
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible || (isLoading && announcements.length === 0) || announcements.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 py-2 bg-gradient-to-r from-primary via-primary/95 to-primary shadow-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        exit={{ y: -80 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto relative overflow-hidden">
          <div className="relative h-12 md:h-14 flex items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell className="h-5 w-5 text-primary-foreground flex-shrink-0" />
              </motion.div>
            </motion.div>

            <AnimatePresence mode="sync">
              {announcements.length > 0 && (
                <motion.div
                  key={currentIndex}
                  className="absolute inset-0 flex items-center justify-center text-primary-foreground px-12"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <span className="font-bold text-sm md:text-base">{announcements[currentIndex]?.title}:</span>
                    <span className="ml-2 text-sm md:text-base">{announcements[currentIndex]?.message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {announcements.length > 1 && (
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="pointer-events-auto"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/20 text-primary-foreground hover:bg-white/30"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous announcement</span>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="pointer-events-auto"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/20 text-primary-foreground hover:bg-white/30"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next announcement</span>
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Dot Indicators */}
            {announcements.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {announcements.map((_, index) => (
                  <motion.button
                    key={index}
                    className={cn(
                      "rounded-full transition-all h-2",
                      index === currentIndex
                        ? "bg-primary-foreground w-6"
                        : "bg-primary-foreground/40 w-2"
                    )}
                    onClick={() => setCurrentIndex(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to announcement ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Dismiss Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-1/2 right-3 -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-white/20 text-primary-foreground hover:bg-white/30"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
