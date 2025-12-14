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
  const [selected, setSelected] = useState<SubmissionCard | null>(null);

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

  const averageScore = subs.length
    ? Math.round(subs.reduce((acc, cur) => acc + (cur.points_earned || 0), 0) / subs.length)
    : 0;

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

        {!loading && subs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Submissions" value={subs.length.toString()} />
            <StatCard label="Avg score" value={averageScore ? `${averageScore}/100` : 'n/a'} />
            <StatCard label="Source" value={source} />
          </div>
        )}

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
              <button
                key={s.id || idx}
                onClick={() => setSelected(s)}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full text-left hover:border-blue-200 hover:shadow-md transition"
              >
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
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500">Source: {source}</p>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative animate-[fadeIn_0.2s_ease]">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
            >
              ✕
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Submission detail</p>
            <h2 className="text-2xl font-semibold text-slate-900">{selected.task_title || 'Unknown task'}</h2>
            <p className="text-sm text-slate-500 mb-4">{new Date(selected.created_at || Date.now()).toLocaleString()}</p>
            <p className="text-sm text-slate-600 mb-2">Candidate: {selected.user_email || 'Unknown'}</p>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <StatCard label="Score" value={selected.points_earned !== undefined ? `${selected.points_earned}/100` : 'n/a'} />
              <StatCard label="Recording" value={selected.recording_url ? 'Available' : 'Not available'} highlight={!!selected.recording_url} />
              <StatCard label="Source" value={source} />
            </div>

            {selected.review_summary && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-800 leading-relaxed">
                {selected.review_summary}
              </div>
            )}

            {selected.evaluation_json?.scores && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-slate-800">Score breakdown</p>
                <ScoreBars scores={selected.evaluation_json.scores} />
              </div>
            )}

            {selected.evaluation_json?.risks?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-800">Risks</p>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {selected.evaluation_json.risks.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              {selected.recording_url && (
                <a
                  href={selected.recording_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 hover:border-slate-300"
                >
                  View recording
                </a>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'} p-4`}>
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

