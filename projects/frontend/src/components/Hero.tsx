import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface HeroProps {
  onStartClub?: () => void
}

const Hero = ({ onStartClub }: HeroProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events')
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const headingVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    },
  }

  const subheadingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  const arrowVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
    animate: {
      y: [0, 10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  // Algorand logo with animation
  const LogoAnimation = {
    float: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-tech">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/40 to-emerald-50/40 backdrop-blur-sm" />
        
        {/* Animated dot grid */}
        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dot-pattern-light"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <motion.circle
                cx="2"
                cy="2"
                r="1.5"
                className="fill-primary"
                initial={{ opacity: 0.1 }}
                animate={{
                  opacity: [0.1, 0.25, 0.1],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern-light)" />
        </svg>
      </div>

      {/* Corner decorative circles with Algorand branding */}
      <motion.div
        className="absolute top-12 left-8 w-32 h-32 rounded-full bg-gradient-to-br from-blue-200/20 to-blue-100/20 backdrop-blur-md border border-blue-300/30"
        animate={LogoAnimation.float}
      >
        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
          🔷
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-16 right-8 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-200/20 to-emerald-100/20 backdrop-blur-md border border-emerald-300/30"
        animate={{
          y: [0, 25, 0],
          rotate: [360, 180, 0],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-7xl opacity-30">
          🅰️
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Heading */}
        <motion.h1
          variants={headingVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
        >
          <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
            Decentralized
          </span>
          <span className="block mt-2 text-neutral">Campus Events</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={subheadingVariants}
          className="text-lg sm:text-xl md:text-2xl text-neutral/70 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Discover events, buy NFT tickets, and access exclusive campus
          experiences powered by{' '}
          <span className="text-blue-600 font-semibold">Algorand</span>.
          <br className="hidden sm:block" />
          Secure, transparent, and built for students.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onStartClub}
          className="btn btn-primary btn-lg shadow-xl text-lg px-12 py-4 relative overflow-hidden group text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0"
        >
          <span className="relative z-10">Start a Club</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* Feature badges */}
        <motion.div
          variants={subheadingVariants}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {[
            { icon: '🔐', text: 'Blockchain Secured' },
            { icon: '🎫', text: 'NFT Tickets' },
            { icon: '⚡', text: 'Instant Transfers' },
            { icon: '🌐', text: 'Decentralized' },
          ].map((badge, index) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="px-5 py-3 rounded-full bg-gradient-to-r from-white/80 to-blue-50/50 backdrop-blur-md border border-blue-200/50 shadow-md hover:shadow-lg hover:from-white to-blue-50 transition-all"
            >
              <span className="text-xl mr-2">{badge.icon}</span>
              <span className="font-semibold text-neutral text-sm">{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll down arrow */}
      <motion.div
        variants={arrowVariants}
        initial="hidden"
        animate={['visible', 'animate']}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-20"
        onClick={scrollToEvents}
      >
        <div className="flex flex-col items-center gap-2 group">
          <span className="text-sm font-medium text-neutral/60 group-hover:text-blue-600 transition-colors">
            Explore Events
          </span>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600 group-hover:text-emerald-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </motion.svg>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero
