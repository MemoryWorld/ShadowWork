'use client';

import { useEffect, useState } from 'react';
import type { EvaluationResult, SubmissionResponsePayload } from '@/types';

type StoredSummary = {
  title?: string;
  points?: SubmissionResponsePayload['points'];
  offerQualified?: boolean;
  evaluation?: EvaluationResult | null;
  recordingUrl?: string | null;
};

export default function SuccessPage() {
  const [summary, setSummary] = useState<StoredSummary | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('shadowwork_last_submission');
    if (stored) {
      try {
        setSummary(JSON.parse(stored));
      } catch {
        setSummary(null);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto px-6 py-10 text-left space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-green-700">Submission report</p>
          <h1 className="text-4xl font-semibold text-gray-900 mt-2">Challenge Submitted</h1>
          <p className="text-lg text-gray-600 mt-3">
            Summary of your replay, scoring rationale, and follow-up notes.
          </p>
        </header>

        <section className="space-y-2 text-gray-800">
          <h2 className="text-xl font-semibold">Context</h2>
          <p><strong>Challenge:</strong> {summary?.title || 'Unknown task'}</p>
          {summary?.points && (
            <p>
              <strong>Points:</strong> {summary.points.earned} / {summary.points.total}
              {summary.offerQualified ? ' • Offer qualified' : ''}
            </p>
          )}
          {summary?.recordingUrl ? (
            <p>
              <strong>Recording:</strong>{' '}
              <a
                className="text-blue-700 underline"
                href={summary.recordingUrl}
                target="_blank"
                rel="noreferrer"
              >
                View replay
              </a>
            </p>
          ) : (
            <p className="text-sm text-gray-500">Recording not available (demo mode)</p>
          )}
        </section>

        {summary?.evaluation && (
          <section className="space-y-6 text-gray-800">
            <h2 className="text-xl font-semibold text-gray-900">AI Evaluation (existing spec)</h2>
            <p className="text-sm text-gray-600">
              Scored via evaluator prompt（理解/实现/验证/沟通四个维度，各 0–25 分）。
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {(['understanding', 'implementation', 'validation', 'communication'] as const).map((key) => (
                <div key={key} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {summary.evaluation?.scores[key]}/25
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-700">
              <strong>Total:</strong> {summary.evaluation.scores.total}/100 • <strong>Match:</strong> {summary.evaluation.scores.matchScore}/100
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {(['understanding', 'implementation', 'validation', 'communication'] as const).map((key) => (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1)} rationale
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {summary.evaluation?.rationale[key]?.length
                      ? summary.evaluation.rationale[key].map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))
                      : <li>No notes available</li>}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Risks</h3>
                <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                  {summary.evaluation?.risks?.length
                    ? summary.evaluation.risks.map((risk, idx) => <li key={idx}>{risk}</li>)
                    : <li>No risks captured</li>}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Follow-up questions</h3>
                <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                  {summary.evaluation?.nextInterviewQuestions?.length
                    ? summary.evaluation.nextInterviewQuestions.map((q, idx) => <li key={idx}>{q}</li>)
                    : <li>No follow-up questions</li>}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-3 text-gray-800">
          <h2 className="text-xl font-semibold text-gray-900">Session replay (video)</h2>
          <p className="text-sm text-gray-700">
            如果有视频链接会在下方播放；若是 rrweb JSON，可替换为 rrweb 播放器组件。
          </p>
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 p-4 text-sm text-gray-700">
            {summary?.recordingUrl ? (
              <video className="w-full rounded-md" controls src={summary.recordingUrl || undefined}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <p>No video available. Placeholder for a future replay component.</p>
            )}
          </div>
        </section>

        <section className="space-y-2 text-gray-800">
          <h2 className="text-xl font-semibold text-gray-900">What happens next</h2>
          <Step number={1} text="The company will receive an anonymized notification" />
          <Step number={2} text="They'll review your session replay to see your problem-solving approach" />
          <Step number={3} text="You'll be contacted directly if they want to proceed" />
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Take Another Challenge
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-3 bg-white border border-gray-200 text-gray-800 rounded-lg font-semibold hover:border-gray-300 hover:shadow-sm transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 border border-blue-200 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
        {number}
      </div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}
