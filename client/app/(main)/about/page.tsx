'use client'

import { BookOpen, Users, Globe, Shield, Heart, ArrowRight, Target, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function AboutPage() {
  const router = useRouter()

  

  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "We believe in building a vibrant community of readers and supporting local authors and publishers.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making books available to everyone, everywhere in Nepal with our innovative digital platform.",
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: Shield,
      title: "Quality",
      description: "Curating only the best books and ensuring the highest quality reading experience for all.",
      color: "from-blue-700 to-blue-800"
    }
  ]

  const stats = [
    { number: "10K+", label: "Active Readers" },
    { number: "5K+", label: "Books Available" },
    { number: "500+", label: "Authors Supported" },
    { number: "2023", label: "Year Founded" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Story</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Connecting Readers with
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="block bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent"
              >
                Stories That Matter
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              BookBazzar is Nepal&apos;s premier digital marketplace for buying and selling books. We&apos;re passionate about making literature accessible to everyone and empowering local authors.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent mb-2"
                >
                  {stat.number}
                </motion.div>
                <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-700/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-card rounded-2xl p-8 border border-border overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="flex items-center justify-center h-64"
                  >
                    <BookOpen className="w-24 h-24 text-primary opacity-80" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Our Journey</h2>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Founded in 2023, BookBazzar began with a simple yet powerful vision: to revolutionize how Nepali readers discover and share books. Our founders recognized a gap in the market and set out to create a platform that would empower both readers and authors.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    What started as a passion project has grown into Nepal&apos;s fastest-growing digital bookstore, serving thousands of passionate readers and supporting hundreds of local authors.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Today, we&apos;re committed to building a thriving ecosystem where books and readers connect seamlessly, and every voice gets heard.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at BookBazzar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="group h-full bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>

                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      whileHover={{ opacity: 1, width: "100%" }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 h-1 bg-gradient-to-r from-primary to-blue-700 rounded-full"
                    ></motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

     

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 to-blue-700/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6 border border-primary/30"
              >
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Our Mission</span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Empowering Readers, Supporting Authors
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg text-muted-foreground mb-8 leading-relaxed"
              >
                We believe every story deserves to be told and every reader deserves access to quality literature. Our mission is to create a vibrant ecosystem where books flow freely, authors are empowered, and reading becomes more accessible and affordable for everyone in Nepal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold"
                  onClick={() => router.push("/")}
                >
                  Explore Our Books
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-12 text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-8 h-8 text-primary" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Our Community
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-lg mb-8 leading-relaxed"
            >
              Become part of Nepal&apos;s fastest-growing community of digital readers. Discover new books, connect with fellow readers, support local authors, and help us make literature accessible to everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
                onClick={() => router.push("/")}
              >
                Start Reading
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-foreground hover:bg-primary/10 font-semibold"
                onClick={() => router.push("/contactus")}
              >
                Get in Touch
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
