'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getMockUser } from '@/lib/mockAuth';

export default function SubmissionDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [submission, setSubmission] = useState<any>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = getMockUser();
        const email = me?.email || '';
        const res = await fetch(`/api/submissions?scope=mine&email=${encodeURIComponent(email)}`, {
          headers: { 'x-demo-role': localStorage.getItem('shadowwork_role') || '' },
        });
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

      // fallback local
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Submission detail</p>
            <h1 className="text-3xl font-bold text-slate-900">{submission?.task_title || 'Unknown task'}</h1>
            <p className="text-sm text-slate-600">{submission ? new Date(submission.created_at || Date.now()).toLocaleString() : '...'}</p>
          </div>
          <Link href="/submissions" className="text-sm text-slate-600 hover:text-slate-900">← Back</Link>
        </div>

        {loading && <p className="text-sm text-slate-600">Loading...</p>}
        {!loading && !submission && (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 bg-white">
            <p className="text-sm text-slate-700">Submission not found.</p>
          </div>
        )}

        {submission && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <StatCard label="Score" value={submission.points_earned !== undefined ? `${submission.points_earned}/100` : 'n/a'} />
              <StatCard label="Recording" value={submission.recording_url ? 'Available' : 'Not available'} highlight={!!submission.recording_url} />
            </div>

            {submission.review_summary && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed shadow-sm">
                {submission.review_summary}
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
                <div className="w-full h-60 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex flex-col items-center justify-center text-sm text-slate-600">
                  <div className="w-16 h-16 rounded-full bg-slate-300/70 animate-pulse mb-3" />
                  <p className="font-semibold text-slate-700">Video placeholder</p>
                  <p className="text-xs text-slate-500">Recording will appear here after submission.</p>
                </div>
              )}
            </div>

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
