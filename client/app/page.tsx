'use client'

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, BookOpen, ShoppingBag, Users, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import BookCarousel from "./components/BookCarousel" 
import BestsellerSection from "./components/BestsellerSection"
import AnnouncementBanner from "./components/AnnouncementBanner"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />

      <main className="flex-1 pt-16 md:pt-20">
        {/* Featured Carousel Section */}
        <section className="w-full">
          <BookCarousel />
        </section>

        {/* Bestsellers Section */}
        <motion.section
          className="container py-16 md:py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="flex items-center justify-between mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.div
              className="space-y-2"
              variants={{itemVariants}}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-1 w-12 bg-blue rounded-full"
                  layoutId="underline"
                />
                <span className="text-blue font-semibold text-sm tracking-wide">POPULAR READS</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                Bestselling Books
              </h2>
            </motion.div>
            <Link href="/bestsellers" className="hidden md:block">
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-blue/30 text-blue hover:bg-blue/5"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <BestsellerSection />
          <motion.div
            className="flex md:hidden justify-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/bestsellers">
              <Button className="bg-blue hover:bg-blue/90">
                View All Bestsellers
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-16 md:py-24 bg-gradient-to-br from-blue/5 via-transparent to-accent/5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container">
            <motion.div
              className="text-center mb-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.8 }}
            >
              <motion.h2
                className="text-4xl font-bold tracking-tight text-foreground mb-4"
                variants={{itemVariants}}
              >
                Why BookBazzar?
              </motion.h2>
              <motion.p
                className="text-foreground/60 max-w-2xl mx-auto text-lg"
                variants={{itemVariants}}
              >
                Your ultimate marketplace for buying and selling books. Connect with fellow readers and find your next favorite story.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              {[
                {
                  icon: ShoppingBag,
                  title: "Easy Buying",
                  description: "Browse thousands of books and find your next read with our intuitive search and filters.",
                },
                {
                  icon: BookOpen,
                  title: "Sell Your Books",
                  description: "List your unused books and earn money. Simple posting process and secure transactions.",
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Connect with book lovers, share reviews, and discover recommendations from real readers.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    variants={{itemVariants}}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <div className="group relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="relative bg-white rounded-2xl p-8 border border-blue/10 hover:border-blue/30 transition-colors duration-300">
                        <motion.div
                          className="inline-block p-4 bg-blue/10 rounded-xl mb-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="h-6 w-6 text-blue" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                        <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="container py-16 md:py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.div
              className="space-y-6 order-2 lg:order-1"
              variants={{itemVariants}}
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue/10 text-blue font-medium text-sm">
                  <Sparkles className="h-4 w-4" />
                  Join Our Community
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-foreground">
                  Start Your Journey Today
                </h2>
                <p className="text-foreground/60 text-lg leading-relaxed">
                  Get access to thousands of books, exclusive events, and connect with fellow readers. Whether you&apos;re looking to buy your next favorite read or sell books you no longer need, BookBazzar has you covered.
                </p>
              </div>

              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                variants={{itemVariants}}
              >
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="bg-blue hover:bg-blue/90 text-blue-foreground gap-2 h-12 px-6">
                      Sign Up Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/about">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="h-12 px-6">
                      Learn More
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                className="flex items-center gap-6 pt-4"
                variants={{itemVariants}}
              >
                {[
                  { label: "10K+", desc: "Active Users" },
                  { label: "50K+", desc: "Books Listed" },
                  { label: "4.9/5", desc: "Rating" },
                ].map((badge, index) => (
                  <div key={index} className="text-sm">
                    <motion.p
                      className="font-bold text-foreground text-lg"
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      {badge.label}
                    </motion.p>
                    <p className="text-foreground/60">{badge.desc}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Image */}
            <motion.div
              className="flex items-center justify-center order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src="https://thumbs.dreamstime.com/b/book-cover-design-template-abstract-splash-vector-art-96808957.jpg"
                  alt="Reading community"
                  width={450}
                  height={350}
                  className="rounded-2xl object-cover shadow-2xl border-4 border-white/50"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Newsletter Section */}
        <motion.section
          className="py-16 md:py-24 bg-gradient-to-r from-blue/10 via-blue/5 to-accent/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="container text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-foreground mb-4"
              variants={{itemVariants}}
            >
              Stay Updated
            </motion.h2>
            <motion.p
              className="text-foreground/60 max-w-2xl mx-auto mb-8 text-lg"
            variants={{itemVariants}}
            >
              Get the latest book recommendations, deals, and community updates delivered to your inbox.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
              variants={{itemVariants}}
            >
              <motion.input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white border-2 border-blue/20 focus:border-blue outline-none transition-colors"
                whileFocus={{ borderColor: "hsl(var(--blue))" }}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-blue hover:bg-blue/90 text-blue-foreground px-6 h-auto py-3">
                  Subscribe
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  )
}
// Homepage with full sections
// Motion animations added
// Newsletter subscription section
