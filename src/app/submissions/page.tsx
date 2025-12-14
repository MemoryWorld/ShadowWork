'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMockUser } from '@/lib/mockAuth';

type SubmissionCard = {
  id?: string;
  task_title?: string;
  points_earned?: number;
  review_summary?: string | null;
  evaluation_json?: any;
  recording_url?: string | null;
  created_at?: string;
};

export default function SubmissionsPage() {
  const [subs, setSubs] = useState<SubmissionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local' | 'unknown'>('unknown');

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const me = getMockUser();
        const email = me?.email || '';
        const res = await fetch(`/api/submissions?scope=mine&email=${encodeURIComponent(email)}`, {
          headers: { 'x-demo-role': localStorage.getItem('shadowwork_role') || '' },
        });
        const data = await res.json();
        if (data?.submissions?.length) {
          setSubs(data.submissions);
          setSource(data.source || 'unknown');
          return;
        }
      } catch (err) {
        console.warn('[submissions] api fetch failed', err);
      }

      // fallback to local storage
      try {
        const stored = localStorage.getItem('shadowwork_submissions');
        if (stored) {
          setSubs(JSON.parse(stored));
          setSource('local');
        }
      } catch {}
      setLoading(false);
    };
    fetchSubs().finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">My Submissions</p>
            <h1 className="text-3xl font-bold text-slate-900">Review your results</h1>
            <p className="text-sm text-slate-600">Scores, AI review summary, and recording links.</p>
          </div>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back</Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading...</p>
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
                  </div>
                  {s.points_earned !== undefined && (
                    <span className="text-sm font-semibold text-blue-700">Score: {s.points_earned}</span>
                  )}
                </div>
                {s.review_summary && (
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{s.review_summary}</p>
                )}
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

