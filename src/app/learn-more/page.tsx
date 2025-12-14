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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-16 w-64 h-64 bg-blue-200/30 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200/30 blur-3xl rounded-full" />
      </div>

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
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Platform</p>
              <span className="text-lg font-bold text-gray-900">ShadowWork</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-blue-200 bg-white shadow-sm text-sm text-blue-700 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Built for real-world engineering signals
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              How It Works
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how ShadowWork transforms technical hiring with AI-powered assessments and real-world challenges
          </p>
        </motion.div>

        {/* Pill stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14"
        >
          {[
            { label: 'Signal-rich replays', value: 'Full IDE capture' },
            { label: 'Assessment depth', value: 'Code + tests + rationale' },
            { label: 'Fairness', value: 'Skills, not resumes' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-100 bg-white/90 backdrop-blur shadow-sm p-5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-base font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feature Slides */}
        <div className="grid gap-12">
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
              <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-white">
                {/* Image Container */}
                <div className={`relative w-full aspect-[4/3] md:min-h-[380px] ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-contain p-4 md:p-6 relative z-10 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 720px"
                    priority={index === 0}
                  />
                </div>

                {/* Content */}
                <div className={`p-8 md:p-12 flex flex-col justify-center space-y-4 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-600 w-fit">
                    Feature {index + 1}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {slide.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-blue-700 font-semibold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      {index + 1}
                    </span>
                    <span>Built-in signal capture and review-ready output</span>
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
          className="mt-20 mb-14"
        >
          <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-3xl p-8 md:p-12 text-center text-gray-900 shadow-xl relative overflow-hidden border border-gray-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
              <div className="absolute top-0 left-10 w-56 h-56 bg-blue-100 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 right-10 w-64 h-64 bg-purple-100 rounded-full blur-[120px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Ready to Prove Your Skills?
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
                Join thousands of developers showcasing their abilities with real code
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="px-9 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                >
                  Start Your Challenge
                </Link>
                <Link
                  href="/generate"
                  className="px-9 py-4 bg-white text-gray-900 rounded-xl text-lg font-bold hover:shadow-md transition-all duration-300 border border-gray-200 w-full sm:w-auto"
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
