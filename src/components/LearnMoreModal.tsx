'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, Code, GitBranch, Lock, Video, Terminal, CheckCircle2 } from 'lucide-react';

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LearnMoreModal({ isOpen, onClose }: LearnMoreModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">About ShadowWork</h2>
                  <p className="text-blue-100 mt-1">Privacy-First Technical Assessment Platform</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6 space-y-8">
                {/* Overview */}
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">What is ShadowWork?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ShadowWork is a revolutionary platform that transforms real-world engineering issues 
                    into ephemeral, browser-based coding challenges. We preserve the technical complexity 
                    of real bugs while completely anonymizing business context, protecting intellectual property 
                    and eliminating resume bias.
                  </p>
                </section>

                {/* Core Features */}
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Core Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FeatureItem
                      icon={<Shield className="w-5 h-5" />}
                      title="Privacy-First"
                      description="Zero IP leakage. Original PRs, company names, and business contexts are completely obfuscated."
                    />
                    <FeatureItem
                      icon={<Zap className="w-5 h-5" />}
                      title="Real Environment"
                      description="Full Node.js runtime powered by WebContainers. Run real code, not pseudocode or simulations."
                    />
                    <FeatureItem
                      icon={<Code className="w-5 h-5" />}
                      title="Real-World Challenges"
                      description="Tasks are generated from actual bug fixes in open-source projects, preserving technical complexity."
                    />
                    <FeatureItem
                      icon={<Video className="w-5 h-5" />}
                      title="Session Recording"
                      description="Optimized rrweb recording captures your problem-solving process with 94% size reduction."
                    />
                    <FeatureItem
                      icon={<Terminal className="w-5 h-5" />}
                      title="Zero Setup"
                      description="Everything runs in your browser. No installations, configurations, or environment setup required."
                    />
                    <FeatureItem
                      icon={<Lock className="w-5 h-5" />}
                      title="Secure & Ephemeral"
                      description="Sessions are temporary and secure. No data persistence, complete privacy protection."
                    />
                  </div>
                </section>

                {/* How It Works */}
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <ProcessStep
                      number={1}
                      title="Real Bug Transformation"
                      description="We extract real bug fixes from open-source GitHub repositories and use AI to transform them into anonymous coding challenges. The technical bug pattern remains identical, but the business context is completely changed."
                    />
                    <ProcessStep
                      number={2}
                      title="Browser-Based Environment"
                      description="Using WebContainers technology, you get a full Node.js runtime directly in your browser. Write code, run tests, install packages - everything works exactly as it would in a real development environment."
                    />
                    <ProcessStep
                      number={3}
                      title="Session Capture"
                      description="Your entire problem-solving process is recorded using optimized session recording technology. We capture code snapshots, terminal outputs, and your thought process timeline."
                    />
                    <ProcessStep
                      number={4}
                      title="AI-Powered Evaluation"
                      description="Submissions are evaluated using AI to assess code quality, problem-solving approach, and technical skills - all while maintaining complete anonymity."
                    />
                  </div>
                </section>

                {/* Privacy Protection */}
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Privacy Protection</h3>
                      <p className="text-blue-800 mb-3">
                        ShadowWork is designed with privacy at its core. Here's what we protect:
                      </p>
                      <ul className="space-y-2">
                        <PrivacyItem text="No original repository information is exposed" />
                        <PrivacyItem text="No company names or business contexts" />
                        <PrivacyItem text="No PR IDs or issue numbers" />
                        <PrivacyItem text="Complete domain obfuscation (Finance → Gaming, Healthcare → E-commerce)" />
                        <PrivacyItem text="Sessions are ephemeral and secure" />
                        <PrivacyItem text="Only anonymized technical patterns are preserved" />
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Use Cases */}
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Perfect For</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <UseCaseCard
                      title="Technical Hiring"
                      description="Assess candidates' real problem-solving skills without resume bias."
                    />
                    <UseCaseCard
                      title="Skill Development"
                      description="Practice with real-world coding challenges in a safe environment."
                    />
                    <UseCaseCard
                      title="Code Review Training"
                      description="Learn from actual bug fixes while protecting IP."
                    />
                  </div>
                </section>

                {/* Technology Stack */}
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Built With</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js', 'WebContainers', 'Monaco Editor', 'rrweb', 'TypeScript', 'Tailwind CSS', 'Ollama/OpenAI'].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Ready to experience ShadowWork?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    See How It Works
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="text-blue-600 flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PrivacyItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-blue-800">
      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}

function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
