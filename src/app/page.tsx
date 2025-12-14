'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockUser, logout, type MockUser } from '@/lib/mockAuth';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/animation';
import { Background } from '../components/ui/Background';
import { User } from 'lucide-react';
/**
 * Landing Page
 * 
 * Module D: User Journey - Starting point
 * "Start Challenge" -> Github OAuth
 */

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [isEnterprise, setIsEnterprise] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const u = getMockUser();
    setUser(u);
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('shadowwork_role');
      const enterpriseHint =
        role === 'enterprise' ||
        (u?.email && (u.email.includes('+enterprise') || u.email.includes('corp')));
      setIsEnterprise(Boolean(enterpriseHint));
    }
  }, []);

  const handleStartChallenge = () => {
    // Check if user is logged in
    if (!user) {
      // Show friendly message and redirect to login
      if (confirm('Please sign in to start a challenge. Sign in now?')) {
        router.push('/login');
      }
      return;
    }

    setIsLoading(true);
    // Go to challenge with mock data
    router.push('/challenge?mock=true');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };


  return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-700 relative">
      <Background />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">ShadowWork</span>
          </div>
          <nav className="flex items-center gap-6">
            {/* Enterprise-only: Generator */}
            {isEnterprise && (
              <a href="/generate" className="text-blue-600 hover:text-blue-800 font-medium">🔬 Generator</a>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <User size={16} />
                  <span>{user.email}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Privacy-First Technical Assessment
          </div>

          {/* <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Zero-Resume,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Proof-of-Work
            </span>
          </h1> */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Zero-Resume,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Proof-of-Work
            </span>
          </motion.h1>
          {/* <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Turn real-world engineering issues into ephemeral, browser-based coding challenges.
            <br />
            No IP leakage. No resume bias. Pure skill demonstration.
          </p> */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-xl text-gray-600 mb-12 leading-relaxed"
          >
            Turn real-world engineering issues into ephemeral, browser-based coding challenges.
            <br />
            No IP leakage. No resume bias. Pure skill demonstration.
          </motion.p>
          {/* <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleStartChallenge}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start Challenge'}
            </button>
            <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-300 hover:shadow-lg transition-all">
              Learn More
            </button>
          </div> */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.16}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={handleStartChallenge}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Start Challenge'}
            </button>

            <Link
              href="/learn-more"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-300 hover:shadow-lg transition-all inline-block text-center"
            >
              Learn More
            </Link>
          </motion.div>

          <p className="text-sm text-gray-500 mt-6">
            {user ? (
              <span className="text-green-600 font-medium">
                ✓ Signed in as {user.email} • Ready to start!
              </span>
            ) : (
              <>No installation required • Runs in your browser • Complete in 30-45 min</>
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon="🔒"
            title="Privacy-First"
            description="No leakage of original PR IDs or company information. Your intellectual property is protected."
          />
          <FeatureCard
            icon="⚡"
            title="Real Environment"
            description="Full Node.js runtime in the browser with WebContainers. Run real code, not pseudocode."
          />
          <FeatureCard
            icon="📹"
            title="Session Recording"
            description="Optimized rrweb recording captures your problem-solving process without bloating data."
          />
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard number={1} title="Start Challenge" description="Click and go - no setup needed" />
            <StepCard number={2} title="Code Solution" description="Real editor, real runtime" />
            <StepCard number={3} title="Run Tests" description="Validate your solution" />
            <StepCard number={4} title="Submit" description="Send replay to company" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 text-sm">
          <p>ShadowWork v3.0 - Lyrathon MVP</p>
          <p className="mt-2">Built with Next.js, WebContainers, and rrweb</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
