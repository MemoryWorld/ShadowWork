'use client';

import { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Upload, FileText, Check } from 'lucide-react';
import { getMockUser, type MockUser } from '@/lib/mockAuth';

type SocialStatus = {
  github: 'connected' | 'disconnected';
  linkedin: 'connected' | 'disconnected';
};

type BasicInfo = {
  name: string;
  gender: string;
  location: string;
  birthday: string;
  summary: string;
  website: string;
};

type ResumeInsights = {
  techStack: string[];
  domains: string[];
  years: number;
  summary: string;
  roles: string[];
  expertise: string[];
  projectHighlights: string[];
  taskHints: string[];
  recommendedRepos: string[];
};

export default function ProfilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedStack, setExtractedStack] = useState<string[]>([]);
  const [socialStatus, setSocialStatus] = useState<SocialStatus>({ github: 'disconnected', linkedin: 'disconnected' });
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: 'Guest',
    gender: 'Prefer not to say',
    location: 'Add location',
    birthday: 'Add birthday',
    summary: 'Add a short summary',
    website: 'Add a website',
  });
const [resumeInsights, setResumeInsights] = useState<ResumeInsights>({
  techStack: [],
  domains: [],
  years: 0,
  summary: '',
  roles: [],
  expertise: [],
  projectHighlights: [],
  taskHints: [],
  recommendedRepos: [],
});

const [user, setUser] = useState<MockUser | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const [activeSection, setActiveSection] = useState<'basic' | 'account' | 'social' | 'resume'>('basic');
const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'error'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // hydrate from localStorage
    try {
      const storedStack = localStorage.getItem('shadowwork_user_techstack');
      if (storedStack) setExtractedStack(JSON.parse(storedStack));
    } catch {}
    try {
      const storedSocial = localStorage.getItem('shadowwork_social_status');
      if (storedSocial) setSocialStatus(JSON.parse(storedSocial));
    } catch {}
    try {
      const storedBasic = localStorage.getItem('shadowwork_basic_info');
      if (storedBasic) setBasicInfo(JSON.parse(storedBasic));
    } catch {}
    try {
      const storedProfile = localStorage.getItem('shadowwork_resume_profile');
      if (storedProfile) setResumeInsights(JSON.parse(storedProfile));
    } catch {}
    const hash = window.location.hash.replace('#', '') as typeof activeSection;
    if (hash && ['basic', 'account', 'social', 'resume'].includes(hash)) {
      setActiveSection(hash);
    }
    setUser(getMockUser());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('shadowwork_social_status', JSON.stringify(socialStatus));
  }, [socialStatus]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('shadowwork_basic_info', JSON.stringify(basicInfo));
  }, [basicInfo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('shadowwork_resume_profile', JSON.stringify(resumeInsights));
  }, [resumeInsights]);

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadProgress(0);
    setAnalysisStatus('analyzing');
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const stack = detectTechStack(selectedFile.name);
          setExtractedStack(stack);
          analyzeResume(selectedFile, stack);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const detectTechStack = (hint: string): string[] => {
    const lower = hint.toLowerCase();
    const stack: string[] = [];
    if (lower.includes('react')) stack.push('React');
    if (lower.includes('next')) stack.push('Next.js');
    if (lower.includes('node')) stack.push('Node.js');
    if (lower.includes('ts') || lower.includes('typescript')) stack.push('TypeScript');
    if (lower.includes('python')) stack.push('Python');
    if (lower.includes('go ')) stack.push('Go');
    if (stack.length === 0) {
      stack.push('JavaScript', 'Node.js', 'TypeScript');
    }
    return Array.from(new Set(stack));
  };

  const buildResumeProfile = (stack: string[]): ResumeInsights => {
    const domains: string[] = [];
    if (stack.some((t) => t.toLowerCase().includes('react') || t.toLowerCase().includes('next'))) domains.push('Frontend');
    if (stack.some((t) => t.toLowerCase().includes('node'))) domains.push('Backend');
    if (domains.length === 0) domains.push('Full-stack');

    const recommendedRepos: string[] = [];
    if (stack.some((t) => t.toLowerCase().includes('react'))) recommendedRepos.push('vercel/next.js', 'facebook/react');
    if (stack.some((t) => t.toLowerCase().includes('node'))) recommendedRepos.push('expressjs/express');
    if (recommendedRepos.length === 0) recommendedRepos.push('shadcn-ui/ui', 'tailwindlabs/tailwindcss');

    return {
      techStack: stack,
      domains,
      years: 3,
      summary:
        'Based on the detected keywords, this looks like a hands-on engineer who can work across the stack with JavaScript/TypeScript and modern web tooling. Without the full resume text we cannot assess scope, delivery impact, or leadership signals, so these insights are indicative only. Uploading a text-based resume will unlock deeper analysis on project outcomes, systems ownership, and collaboration evidence.',
      roles: ['Suggested: Full-stack Engineer'],
      expertise: ['Generalist'],
      projectHighlights: [],
      taskHints: ['API design', 'Testing coverage'],
      recommendedRepos,
    };
  };

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });

  const analyzeResume = async (file: File, stack: string[]) => {
    try {
      const text = await readFileAsText(file);
      const resumeText = text || `Keywords: ${stack.join(', ')}`;
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, techStack: stack }),
      });
      if (!response.ok) throw new Error('Analyze failed');
      const data = await response.json();
      if (data?.insights) {
        const profile: ResumeInsights = {
          techStack: data.insights.techStack || stack,
          domains: data.insights.domains || [],
          years: data.insights.yearsExperience || 0,
          roles: data.insights.roles || [],
          expertise: data.insights.expertise || [],
          projectHighlights: data.insights.projectHighlights || [],
          taskHints: data.insights.taskHints || [],
          recommendedRepos: data.insights.recommendedRepos || [],
          summary: data.insights.summary || 'Resume analyzed.',
        };
        setResumeInsights(profile);
        setExtractedStack(profile.techStack || []);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shadowwork_user_techstack', JSON.stringify(profile.techStack));
          localStorage.setItem('shadowwork_resume_profile', JSON.stringify(profile));
        }
        setAnalysisStatus('idle');
        return;
      }
      throw new Error('No insights returned');
    } catch (error) {
      console.error('[resume] analyze failed', error);
      const fallback = buildResumeProfile(stack);
      setResumeInsights(fallback);
      setExtractedStack(fallback.techStack);
      if (typeof window !== 'undefined') {
        localStorage.setItem('shadowwork_user_techstack', JSON.stringify(fallback.techStack));
        localStorage.setItem('shadowwork_resume_profile', JSON.stringify(fallback));
      }
      setAnalysisStatus('error');
    }
  };

  const toggleSocial = (key: keyof SocialStatus) => {
    setSocialStatus((prev) => ({
      ...prev,
      [key]: prev[key] === 'connected' ? 'disconnected' : 'connected',
    }));
  };

  const updateBasicField = (key: keyof BasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [key]: value || prev[key] }));
  };

  const displayName = user?.email || basicInfo.name || 'Guest';
  const displayInitial = (displayName || 'G').charAt(0).toUpperCase();
  const hasStoredInsights =
    Boolean(resumeInsights.summary?.trim()) ||
    resumeInsights.techStack.length > 0 ||
    resumeInsights.roles.length > 0 ||
    resumeInsights.recommendedRepos.length > 0 ||
    resumeInsights.domains.length > 0 ||
    resumeInsights.expertise.length > 0 ||
    resumeInsights.projectHighlights.length > 0 ||
    resumeInsights.taskHints.length > 0;
  const shouldShowInsights = hasStoredInsights || !!file;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-10 relative">
        <div className="flex gap-6">
          {/* Sticky Sidebar */}
          <aside className="w-48 self-start sticky top-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xl font-semibold shadow">
                {displayInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">Profile • Local</p>
              </div>
            </div>
            <p className="text-xs uppercase text-slate-500 mb-2">Navigation</p>
            <nav className="space-y-2 text-sm text-slate-700">
              <a
                href="#basic"
                onClick={() => setActiveSection('basic')}
                className={`block px-3 py-2 rounded-lg ${activeSection === 'basic' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50'}`}
              >
                Basic Info
              </a>
              <a
                href="#account"
                onClick={() => setActiveSection('account')}
                className={`block px-3 py-2 rounded-lg ${activeSection === 'account' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50'}`}
              >
                Account
              </a>
              <a
                href="#social"
                onClick={() => setActiveSection('social')}
                className={`block px-3 py-2 rounded-lg ${activeSection === 'social' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50'}`}
              >
                Social
              </a>
              <a
                href="#resume"
                onClick={() => setActiveSection('resume')}
                className={`block px-3 py-2 rounded-lg ${activeSection === 'resume' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50'}`}
              >
                Resume
              </a>
            </nav>
            <button
              onClick={() => (window.location.href = '/')}
              className="mt-4 w-full text-sm font-medium text-slate-700 border border-slate-200 rounded-lg py-2 hover:bg-slate-50"
            >
              ← Back
            </button>
          </aside>

          <div className="flex-1 space-y-6">

            {/* Basic Info */}
            <section id="basic" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Info</h3>
              <div className="divide-y divide-slate-100 text-sm">
                <InfoRow label="Name" value={basicInfo.name} onChange={(v) => updateBasicField('name', v)} />
                <InfoRow label="Gender" value={basicInfo.gender} onChange={(v) => updateBasicField('gender', v)} />
                <InfoRow label="Location" value={basicInfo.location} onChange={(v) => updateBasicField('location', v)} />
                <InfoRow label="Birthday" value={basicInfo.birthday} onChange={(v) => updateBasicField('birthday', v)} />
                <InfoRow label="Summary" value={basicInfo.summary} onChange={(v) => updateBasicField('summary', v)} />
                <InfoRow label="Website" value={basicInfo.website} onChange={(v) => updateBasicField('website', v)} />
              </div>
            </section>

            {/* Account info */}
            <section id="account" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h3>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex justify-between py-3">
                  <span className="text-slate-600">Email</span>
                  <span className="text-slate-900 font-medium">{user?.email || 'Not signed in'}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-600">Status</span>
                  <span className="text-slate-900 font-medium">{user ? 'Signed in' : 'Guest'}</span>
                </div>
              </div>
            </section>

            {/* Social connect */}
            <section id="social" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Social Account</h3>
              <div className="space-y-3">
                <SocialRow
                  icon={<Github size={18} />}
                  name="GitHub"
                  status={socialStatus.github}
                  onAction={() => toggleSocial('github')}
                />
                <SocialRow
                  icon={<Linkedin size={18} />}
                  name="LinkedIn"
                  status={socialStatus.linkedin}
                  onAction={() => toggleSocial('linkedin')}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">These toggles simulate OAuth state for the demo.</p>
            </section>

            {/* Resume upload */}
            <section id="resume" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Upload Resume</h3>
                  <p className="text-sm text-slate-500">Parse locally to prefill tech stack for generator (PDF, DOCX).</p>
                </div>
              </div>

              <div
                className={`bg-white p-6 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                  file ? 'border-green-300 bg-green-50/50' : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                />

                {!file ? (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-100 text-purple-600">
                      <Upload size={24} />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Upload Resume</h4>
                    <p className="text-sm text-slate-500 mb-4">Drag & drop or click to browse</p>
                    <span className="mt-auto text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      Auto-fill details
                    </span>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                      {uploadProgress === 100 ? <Check size={24} /> : <FileText size={24} />}
                    </div>
                    <p className="font-medium text-slate-900 truncate max-w-[200px] mb-2">{file.name}</p>
                    
                    {uploadProgress < 100 ? (
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check size={12} /> Upload Complete
                      </p>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); setExtractedStack([]); }}
                      className="mt-4 text-xs text-slate-400 hover:text-red-500"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>

              <div className="text-left text-xs text-slate-500 border-t pt-4">
                {shouldShowInsights ? (
                  <>
                    {extractedStack.length > 0 && (
                      <>
                        <p className="text-sm text-slate-700 font-semibold mb-2">Detected tech stack (stored locally):</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {extractedStack.map((tech) => (
                            <span key={tech} className="px-2 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="space-y-1 text-sm text-slate-700">
                      {resumeInsights.domains.length > 0 && (
                        <p><span className="font-semibold">Domains:</span> {resumeInsights.domains.join(', ')}</p>
                      )}
                      {resumeInsights.years > 0 && (
                        <p><span className="font-semibold">Years:</span> {resumeInsights.years}</p>
                      )}
                      {resumeInsights.recommendedRepos.length > 0 && (
                        <p><span className="font-semibold">Recommended repos:</span> {resumeInsights.recommendedRepos.join(', ')}</p>
                      )}
                      {resumeInsights.roles.length > 0 && (
                        <p><span className="font-semibold">Roles:</span> {resumeInsights.roles.join(', ')}</p>
                      )}
                      {resumeInsights.expertise.length > 0 && (
                        <p><span className="font-semibold">Expertise:</span> {resumeInsights.expertise.join(', ')}</p>
                      )}
                    </div>

                    {resumeInsights.projectHighlights.length > 0 && (
                      <div className="mt-2 space-y-1 text-sm text-slate-700">
                        <p className="font-semibold">Project highlights:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {resumeInsights.projectHighlights.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {resumeInsights.taskHints.length > 0 && (
                      <div className="mt-2 space-y-1 text-sm text-slate-700">
                        <p className="font-semibold">Task suggestions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {resumeInsights.taskHints.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {resumeInsights.summary && (
                      <div className="mt-3 text-sm text-slate-700 leading-relaxed">
                        {resumeInsights.summary}
                      </div>
                    )}
                    {analysisStatus === 'analyzing' && (
                      <p className="text-xs text-blue-600 mt-2">Analyzing resume with AI...</p>
                    )}
                    {analysisStatus === 'error' && (
                      <p className="text-xs text-red-600 mt-2">AI analysis failed, using fallback keywords.</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Upload a resume to generate tailored insights for the generator.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isPlaceholder = value.toLowerCase().includes('add ');
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className={`text-sm font-medium ${isPlaceholder ? 'text-slate-400' : 'text-slate-900'}`}>{value}</p>
      </div>
      <button
        onClick={() => {
          const next = prompt(`Edit ${label}`, value);
          if (next !== null) onChange(next.trim());
        }}
        className="text-sm font-semibold text-blue-600 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

function SocialRow({
  icon,
  name,
  status,
  onAction,
}: {
  icon: React.ReactNode;
  name: string;
  status: 'connected' | 'disconnected';
  onAction: () => void;
}) {
  const isConnected = status === 'connected';
  return (
    <div className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{isConnected ? 'Connected' : 'Not Connected'}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className={`text-sm font-semibold ${isConnected ? 'text-red-600' : 'text-blue-600'} hover:underline`}
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
