'use client';

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

/**
 * Monaco Editor Component
 * 
 * A professional code editor for the challenge sandbox.
 */

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  theme?: 'dark' | 'light';
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  theme = 'dark',
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'
        }`}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme={theme === 'light' ? 'light' : 'vs-dark'}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
    />
  );
}
