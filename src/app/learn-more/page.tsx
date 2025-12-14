'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

/**
 * Learn More Page - Product Showcase
 * 
 * Displays 5 feature slides to showcase the product
 */

const slides = [
  {
    src: '/showcase/slide-1.png',
    alt: 'ShadowWork Feature 1',
    title: 'Real-World Challenges',
    description: 'Solve authentic engineering problems from real GitHub repositories, transformed to protect company IP.',
  },
  {
    src: '/showcase/slide-2.png',
    alt: 'ShadowWork Feature 2',
    title: 'Browser-Based IDE',
    description: 'Code directly in your browser with our powerful WebContainer-based development environment.',
  },
  {
    src: '/showcase/slide-3.png',
    alt: 'ShadowWork Feature 3',
    title: 'Session Recording',
    description: 'Every keystroke and thought process is captured with rrweb for comprehensive review.',
  },
  {
    src: '/showcase/slide-4.png',
    alt: 'ShadowWork Feature 4',
    title: 'AI-Powered Evaluation',
    description: 'Advanced AI analyzes your code quality and provides detailed feedback instantly.',
  },
  {
    src: '/showcase/slide-5.png',
    alt: 'ShadowWork Feature 5',
    title: 'Skills, Not Resumes',
    description: 'Prove your abilities with real code. Build your reputation through verified achievements.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sticky Header */}
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">ShadowWork</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              How It Works
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how ShadowWork transforms technical hiring with AI-powered assessments and real-world challenges
          </p>
        </motion.div>

        {/* Feature Slides */}
        <div className="space-y-16">
          {slides.map((slide, index) => (
            <motion.article
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="group"
            >
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Image Container */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-100">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1152px"
                    priority={index === 0}
                  />
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 border-t border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        {slide.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-24 mb-16"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Ready to Prove Your Skills?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
                Join thousands of developers showcasing their abilities with real code
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="px-10 py-4 bg-white text-blue-600 rounded-xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  Start Your Challenge
                </Link>
                <Link
                  href="/generate"
                  className="px-10 py-4 bg-blue-700 bg-opacity-40 backdrop-blur-sm text-white rounded-xl text-lg font-bold hover:bg-opacity-60 transition-all duration-300 border-2 border-white/30 w-full sm:w-auto"
                >
                  For Companies
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2024 ShadowWork. Skills, Not Resumes. Proof-of-Work.
          </p>
        </div>
      </main>
    </div>
  );
}

