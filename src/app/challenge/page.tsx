'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChallengeWorkspace } from '@/components/ChallengeWorkspace';
import { getMockUser } from '@/lib/mockAuth';
import type { Task } from '@/types';

/**
 * Challenge Page
 * 
 * The main workspace where users solve coding challenges.
 */

function ChallengePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(getMockUser());

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getMockUser();
    if (!currentUser) {
      // Redirect to login if not authenticated
      alert('Please sign in to access challenges');
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadTask();
  }, [searchParams, router]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mockMode = searchParams.get('mock') === 'true';
      const response = await fetch(`/api/generate-task?mock=${mockMode}`);

      if (!response.ok) {
        throw new Error('Failed to load task');
      }

      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (events: any[], sessionTime: number) => {
    if (!task || !user) return;

    try {
      console.log('[Challenge] Submitting solution...');

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          taskId: task.id,
          events,
          difficulty: task.difficulty,
          category: task.category,
          techStack: task.techStack,
          sessionTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      console.log('[Challenge] Submission successful:', result);

      // Note: Success modal is already shown by ChallengeWorkspace component
      // No need for alert here
    } catch (error) {
      console.error('[Challenge] Submission error:', error);
      alert('Failed to submit challenge. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || 'Failed to load challenge'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return <ChallengeWorkspace task={task} onSubmit={handleSubmit} />;
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ChallengePageContent />
    </Suspense>
  );
}

