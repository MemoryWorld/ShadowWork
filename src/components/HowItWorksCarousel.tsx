'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Code, TestTube, Send } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Start Challenge',
    shortDescription: 'Click and go - no setup needed',
    detailedDescription: 'Simply click "Start Challenge" and you\'ll be taken directly to a fully configured coding environment. No installations, no configurations - everything runs in your browser using WebContainers technology.',
    icon: <Play className="w-8 h-8" />,
    features: [
      'Zero setup required - runs entirely in browser',
      'Instant environment provisioning',
      'GitHub OAuth integration for authentication',
      'Real-time session initialization'
    ],
    highlight: 'Everything is ready in seconds, not minutes'
  },
  {
    number: 2,
    title: 'Code Solution',
    shortDescription: 'Real editor, real runtime',
    detailedDescription: 'Write your solution in a full-featured Monaco Editor (same editor as VS Code) with syntax highlighting, autocomplete, and IntelliSense. Your code runs in a real Node.js environment powered by WebContainers.',
    icon: <Code className="w-8 h-8" />,
    features: [
      'Monaco Editor with full TypeScript/JavaScript support',
      'Real Node.js runtime in the browser',
      'File system management and npm package support',
      'Full debugging capabilities'
    ],
    highlight: 'The same editor and runtime you use professionally'
  },
  {
    number: 3,
    title: 'Run Tests',
    shortDescription: 'Validate your solution',
    detailedDescription: 'Test your solution instantly with the integrated terminal. Run tests, execute your code, and see real-time output. All test results are immediately visible, helping you iterate quickly.',
    icon: <TestTube className="w-8 h-8" />,
    features: [
      'Integrated terminal with command execution',
      'Real-time test results and output',
      'Error messages and stack traces',
      'Ability to run multiple test iterations'
    ],
    highlight: 'See results instantly, debug in real-time'
  },
  {
    number: 4,
    title: 'Submit',
    shortDescription: 'Send replay to company',
    detailedDescription: 'When you\'re ready, submit your solution. We capture your entire problem-solving process using optimized session recording, including code snapshots, terminal outputs, and your thought process timeline.',
    icon: <Send className="w-8 h-8" />,
    features: [
      'Full session recording with rrweb technology',
      'Code snapshots at key moments',
      'Optimized file size (94% reduction)',
      'Secure submission with privacy protection'
    ],
    highlight: 'Your entire process is captured, not just the final code'
  }
];

export function HowItWorksCarousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 6000); // 6 seconds per slide

    return () => clearTimeout(timer);
  }, [currentStep, isAutoPlaying]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
    setIsAutoPlaying(false);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
    setIsAutoPlaying(false);
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    setIsAutoPlaying(false);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main Carousel Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        {/* Navigation Buttons */}
        <button
          onClick={prevStep}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all text-gray-700 hover:text-blue-600"
          aria-label="Previous step"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextStep}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all text-gray-700 hover:text-blue-600"
          aria-label="Next step"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Step Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStepData.number} of {steps.length}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Left: Icon and Number */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepData.icon}
                  </motion.div>
                </div>
                <div className="mt-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                    {currentStepData.number}
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {currentStepData.title}
                </h3>
                
                <p className="text-lg text-gray-600 mb-4">
                  {currentStepData.shortDescription}
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {currentStepData.detailedDescription}
                </p>

                {/* Features List */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Key Features:</h4>
                  <ul className="space-y-2">
                    {currentStepData.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm text-blue-800 flex items-start gap-2"
                      >
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Highlight */}
                {currentStepData.highlight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-500 rounded p-3"
                  >
                    <p className="text-sm font-medium text-purple-900">
                      💡 {currentStepData.highlight}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <motion.div
            key={currentStep}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
          />
        </div>
      </div>

      {/* Step Dots Navigation */}
      <div className="flex justify-center items-center gap-3 mt-8">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            className={`transition-all ${
              index === currentStep
                ? 'w-12 bg-gradient-to-r from-blue-600 to-purple-600'
                : 'w-3 bg-gray-300 hover:bg-gray-400'
            } h-3 rounded-full`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Toggle */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isAutoPlaying ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Auto-playing
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Paused
            </>
          )}
        </button>
      </div>
    </div>
  );
}
