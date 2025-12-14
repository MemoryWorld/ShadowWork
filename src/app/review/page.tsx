'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type SubmissionCard = {
  id?: string;
  user_email?: string;
  task_title?: string;
  points_earned?: number;
  review_summary?: string | null;
  recording_url?: string | null;
  evaluation_json?: any;
  created_at?: string;
};

export default function ReviewPage() {
  const [subs, setSubs] = useState<SubmissionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const role = localStorage.getItem('shadowwork_role') || '';
        const res = await fetch('/api/submissions?scope=all', {
          headers: { 'x-demo-role': role || 'enterprise' },
        });
        if (res.status === 403) {
          setError('Forbidden: enterprise access required.');
          return;
        }
        const data = await res.json();
        if (data?.submissions?.length) {
          setSubs(data.submissions);
          setSource(data.source || 'unknown');
          return;
        }
        // fallback local
        const stored = localStorage.getItem('shadowwork_submissions');
        if (stored) {
          setSubs(JSON.parse(stored));
          setSource('local');
        }
      } catch (err) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Enterprise Review</p>
            <h1 className="text-3xl font-bold text-slate-900">Candidate submissions</h1>
            <p className="text-sm text-slate-600">Scores, AI summary, replay links (no source code).</p>
          </div>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back</Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm">{error}</div>
        ) : subs.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 bg-white">
            <p className="text-sm text-slate-700">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subs.map((s, idx) => (
              <div key={s.id || idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{new Date(s.created_at || Date.now()).toLocaleString()}</p>
                    <h2 className="text-lg font-semibold text-slate-900">{s.task_title || 'Unknown task'}</h2>
                    <p className="text-sm text-slate-600">Candidate: {s.user_email || 'Unknown'}</p>
                  </div>
                  {s.points_earned !== undefined && (
                    <span className="text-sm font-semibold text-blue-700">Score: {s.points_earned}</span>
                  )}
                </div>
                {s.review_summary && (
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{s.review_summary}</p>
                )}
                <div className="mt-2 text-xs text-slate-600">
                  {s.evaluation_json?.risks?.length ? (
                    <span>Risks: {s.evaluation_json.risks.join('; ')}</span>
                  ) : (
                    <span>No risks provided</span>
                  )}
                </div>
                {s.recording_url ? (
                  <a className="text-sm text-blue-700 underline" href={s.recording_url} target="_blank" rel="noreferrer">
                    View recording
                  </a>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Recording not available (demo mode)</p>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500">Source: {source}</p>
      </div>
    </div>
  );
}

