"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, BookOpen, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const featuredBooks = [
  {
    id: 1,
    title: "The Himalayan Quest",
    author: "Pramod Bhatta",
    description:
      "An epic journey through the majestic Himalayan mountains of Nepal, discovering ancient wisdom and breathtaking landscapes.",
    coverImage: "https://thumbs.dreamstime.com/b/book-cover-design-template-abstract-splash-vector-art-96808957.jpg",
    link: "/book",
    price: "Rs. 599",
  },
  {
    id: 2,
    title: "Kathmandu Echoes",
    author: "Sushma Joshi",
    description:
      "A captivating tale of life, love and tradition in the ancient city of Kathmandu, where past and present collide.",
    coverImage: "https://i.pinimg.com/736x/32/07/11/32071146324ba2ac854aaec4197295d5.jpg",
    link: "/book",
    price: "Rs. 499",
  },
  {
    id: 3,
    title: "Rivers of Nepal",
    author: "Rajan Khatiwada",
    description:
      "Explore the sacred rivers that flow through Nepal, shaping its culture, spirituality and natural beauty.",
    coverImage: "https://99designs-blog.imgix.net/blog/wp-content/uploads/2022/01/Screenshot-2022-05-04-at-17.20.48-e1651678584559.png?auto=format&q=60&fit=max&w=930",
    link: "/books",
    price: "Rs. 699",
  },
]

export default function BookCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredBooks.length - 1 : prev - 1))
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoplay) {
      interval = setInterval(() => {
        nextSlide()
      }, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoplay, currentSlide])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="space-y-2"
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                  <BookOpen className="h-4 w-4" />
                  Featured Book
                </span>
              </motion.div>

              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground leading-tight">
                {featuredBooks[currentSlide].title}
              </h1>
              <p className="text-xl text-foreground/70 font-medium">
                by {featuredBooks[currentSlide].author}
              </p>
            </motion.div>

            <motion.p
              className="max-w-[600px] text-foreground/60 md:text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {featuredBooks[currentSlide].description}
            </motion.p>

            <motion.div
              className="flex flex-col gap-3 min-[400px]:flex-row pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href={featuredBooks[currentSlide].link}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6">
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now - {featuredBooks[currentSlide].price}
                  </Button>
                </motion.div>
              </Link>
              <Link href="/categories">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" className="h-12 px-6">
                    Preview
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Dot Indicators */}
            <motion.div
              className="flex items-center space-x-3 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {featuredBooks.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index)
                    setAutoplay(false)
                  }}
                  className={`rounded-full transition-all ${
                    currentSlide === index
                      ? "bg-primary w-8 h-2.5"
                      : "bg-foreground/20 w-2.5 h-2.5"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative order-1 lg:order-2 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <AnimatePresence mode="sync">
              <motion.div
                key={currentSlide}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />

                <Image
                  src={featuredBooks[currentSlide].coverImage || "/placeholder.svg"}
                  alt={featuredBooks[currentSlide].title}
                  width={350}
                  height={520}
                  className="rounded-2xl shadow-2xl object-cover relative z-10 border-4 border-white/50"
                  priority
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              className="absolute inset-0 flex items-center justify-between px-4 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm text-primary hover:bg-white shadow-lg"
                  onClick={() => {
                    prevSlide()
                    setAutoplay(false)
                  }}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm text-primary hover:bg-white shadow-lg"
                  onClick={() => {
                    nextSlide()
                    setAutoplay(false)
                  }}
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
