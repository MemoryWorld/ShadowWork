'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function ReviewDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [submission, setSubmission] = useState<any>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const role = localStorage.getItem('shadowwork_role') || 'enterprise';
        const res = await fetch('/api/submissions?scope=all', {
          headers: { 'x-demo-role': role },
        });
        if (res.status === 403) {
          setError('Forbidden: enterprise access required.');
          return;
        }
        const data = await res.json();
        if (data?.submissions) {
          const found = data.submissions.find((s: any) => s.id === id);
          if (found) {
            setSubmission(found);
            setSource(data.source || 'unknown');
            return;
          }
        }
      } catch {}

      try {
        const stored = localStorage.getItem('shadowwork_submissions');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((s: any) => s.id === id);
          if (found) {
            setSubmission(found);
            setSource('local');
            return;
          }
        }
      } catch {}
      setLoading(false);
    };
    load().finally(() => setLoading(false));
  }, [id]);

  const scores = useMemo(() => submission?.evaluation_json?.scores || null, [submission]);
  const demoVideoUrl = '/demo-placeholder.mp4';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Enterprise review</p>
            <h1 className="text-3xl font-bold text-slate-900">{submission?.task_title || 'Unknown task'}</h1>
            <p className="text-sm text-slate-600">{submission ? new Date(submission.created_at || Date.now()).toLocaleString() : '...'}</p>
            <p className="text-sm text-slate-600">Candidate: {submission?.user_email || 'Unknown'}</p>
          </div>
          <Link href="/review" className="text-sm text-slate-600 hover:text-slate-900">← Back</Link>
        </div>

        {error && <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm">{error}</div>}
        {loading && <p className="text-sm text-slate-600">Loading...</p>}
        {!loading && !submission && !error && (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 bg-white">
            <p className="text-sm text-slate-700">Submission not found.</p>
          </div>
        )}

        {submission && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <StatCard label="Recording" value={submission.recording_url ? 'Available' : 'Not available'} highlight={!!submission.recording_url} />
              <StatCard label="Source" value={source} />
            </div>

            {submission.review_summary && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed shadow-sm">
                {submission.review_summary}
              </div>
            )}

            {scores && (
              <div className="space-y-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">Score breakdown</p>
                <ScoreBars scores={scores} />
              </div>
            )}

            {submission.evaluation_json?.risks?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800 mb-2">Risks</p>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {submission.evaluation_json.risks.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800 mb-2">Session replay</p>
              {submission.recording_url ? (
                <a
                  href={submission.recording_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-700 underline"
                >
                  View recording
                </a>
              ) : (
                <div className="w-full h-60 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-sm text-slate-600">
                  Video placeholder (demo)
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500">Source: {source}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function ScoreBars({ scores }: { scores: any }) {
  const items = [
    { key: 'understanding', label: 'Understanding' },
    { key: 'implementation', label: 'Implementation' },
    { key: 'validation', label: 'Validation' },
    { key: 'communication', label: 'Communication' },
  ];
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const value = scores?.[item.key] || 0;
        const pct = Math.min(100, (value / 25) * 100);
        return (
          <div key={item.key}>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{item.label}</span>
              <span className="font-semibold text-slate-800">{value}/25</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
