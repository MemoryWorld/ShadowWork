'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { EvaluationResult } from '@/types';

/**
 * Success Modal with Confetti
 * 
 * Celebrates successful challenge completion
 * Triggers confetti animation for the "Wow" factor
 */

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  points?: number;
  totalPoints?: number;
  offerQualified?: boolean;
  evaluation?: EvaluationResult | null;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  points = 100,
  totalPoints = 100,
  offerQualified = false,
  evaluation = null,
}: SuccessModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti explosion
      const duration = 3000;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] md:w-[72vw] lg:w-[55vw] max-w-3xl max-h-[85vh] mx-4 overflow-hidden flex flex-col">
        {/* Success Animation */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg 
              className="w-12 h-12 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Challenge Completed!
          </h2>
          <p className="text-blue-100">
            Your code replay has been sent to the hiring team
          </p>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* Offer Qualified Badge */}
          {offerQualified && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌟</span>
                <div>
                  <h3 className="font-bold text-yellow-900 text-lg">
                    Offer Threshold Reached!
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    You've qualified for automatic consideration
                  </p>
                </div>
              </div>
            </div>
          )}

          {evaluation && (
            <div className="mb-6 border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span> AI Evaluation Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(['understanding', 'implementation', 'validation', 'communication'] as const).map((key) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs uppercase text-gray-500">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {evaluation.scores[key]}/25
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  Total: {evaluation.scores.total}/100
                </span>
                <span>Match Score: {evaluation.scores.matchScore}/100</span>
              </div>

              {evaluation.nextInterviewQuestions?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase text-gray-500">Suggested follow-ups</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {evaluation.nextInterviewQuestions.slice(0, 2).map((question, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* What's Next */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Your session replay is being analyzed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>The hiring team will review your approach</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>You'll be contacted within 2-3 business days</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Return to Lobby
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
