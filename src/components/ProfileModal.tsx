import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, Linkedin, ArrowRight } from 'lucide-react';
// import { Button } from './ui/button';


interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Build Your Profile</h2>
          <p className="text-slate-500">Import your experience to personalize your assessment.</p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8 bg-slate-50/50">
          
          {/* Option 1: LinkedIn */}
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#0077b5]/10 text-[#0077b5] rounded-xl flex items-center justify-center mb-4">
                <Linkedin size={24} fill="currentColor" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Connect LinkedIn</h3>
              <p className="text-sm text-slate-500 mb-6">Instantly sync your work history, skills, and education.</p>
              
              <button className="mt-auto w-full bg-[#0077b5] hover:bg-[#006097] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>Connect Profile</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Option 2: Resume Upload */}
          <div className="flex flex-col h-full">
            <div 
              className={`flex-1 bg-white p-6 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                isDragging 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-purple-200 text-purple-700' : 'bg-purple-100 text-purple-600'}`}>
                    <Upload size={24} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Upload Resume</h3>
                  <p className="text-sm text-slate-500 mb-4">Drag & drop or click to browse<br/>(PDF, DOCX)</p>
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
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-4 text-xs text-slate-400 hover:text-red-500"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};