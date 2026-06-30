import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../../utils/axiosClient';
import Editor from '@monaco-editor/react';

const difficultyMatrix = {
  easy: 'bg-[#041611] border-[#0d4f3a] text-[#00df89]',
  medium: 'bg-[#191107] border-[#4e320f] text-[#ffaa00]',
  hard: 'bg-[#17080c] border-[#571922] text-[#ff3355]'
};

export default function Solution() {
  const { pid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [problemData, setProblemData] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [solRes, probRes] = await Promise.all([
          axiosClient.get(`/solution/${pid}`),
          axiosClient.get(`/problem/getproblembyid/${pid}`)
        ]);
        setSolutionData(solRes.data.solutionData);
        setProblemData(probRes.data.problem);
      } catch (err) { 
        console.error('Error fetching solution context:', err);
      } finally { 
        setLoading(false); 
      }
    }
    fetchData();
  }, [pid]);

  if (loading || !problemData || !solutionData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090D16] text-slate-500 font-mono text-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#090D16] text-slate-200 antialiased overflow-hidden">
      
      {/* ================= GLOBAL TOP HEADER BREADCRUMB ================= */}
      <header className="border-b border-slate-800/80 bg-[#0C1220] px-6 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          ← Back
        </button>
      </header>

      {/* ================= MAIN DUAL PANEL FRAMEWORK ================= */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        
        {/* ================= LEFT SIDE PANEL ================= */}
        <div className="w-1/2 flex flex-col border-r border-slate-800/80 bg-[#0A0E1A]">
          
          {/* Sub-Layout Tab Navigation Bar */}
          <div className="flex bg-[#0C1220] border-b border-slate-800/80 p-2 justify-between items-center shrink-0">
            <div className="flex bg-[#121826] p-1 rounded-lg border border-slate-800/40 w-full">
              {['description', 'editorial', 'my-submissions', 'peer-submissions'].map((tab) => (
                <button 
                  key={tab}
                  className={`flex-1 text-center text-xs font-medium px-3 py-1.5 rounded-md transition-all whitespace-nowrap uppercase tracking-wider ${
                    activeLeftTab === tab 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveLeftTab(tab)}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Left Content Area Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Tab: Description Overview */}
            {activeLeftTab === 'description' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Header Title Block */}
                <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{problemData.title}</h1>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="bg-[#1e1430] border border-[#3c245c] text-[#c084fc] font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Day {problemData.releaseDay || 1}
                      </span>

                      {/* Difficulty Badge - Matches image_092104.png perfectly */}
                      <span className={`font-sans text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${difficultyMatrix[problemData.difficulty?.toLowerCase() || 'easy']}`}>
                        {problemData.difficulty || 'EASY'}
                      </span>
                    </div>
                  </div>

                  {/* Stakes Box Widget */}
                  <div className="bg-[#121826] border border-slate-800 rounded-xl px-5 py-2.5 flex items-center gap-5 shrink-0 shadow-sm font-sans">
                    <div className="text-center min-w-[60px]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reward</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        +{problemData.baseEloReward || 100}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-800/80 self-center"></div>
                    <div className="text-center min-w-[60px]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Penalty</div>
                      <div className="text-lg font-bold text-rose-500 mt-0.5">
                        -{problemData.penaltyWrongAnswer || 10}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Markdown Text Content */}
                <div className="text-base text-slate-200 font-sans tracking-wide leading-relaxed selection:bg-indigo-500/30">
                  {problemData.description}
                </div>

                {/* Static visual layout matching the problem view criteria */}
                <div className="space-y-6 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2zm0 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2z" />
                    </svg>
                    <h3 className="font-sans font-black text-slate-100 text-base tracking-wider uppercase">
                      Visible Test Cases
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    {problemData.visibleTestCases?.map((example, index) => (
                      <div key={index} className="space-y-2.5">
                        <h4 className="font-sans font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                          Example {index + 1}:
                        </h4>
                        <div className="bg-[#121826]/30 border border-slate-800/60 rounded-xl p-5 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">Input</span>
                            <div className="bg-[#070C15] border border-slate-900 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
                              {example.input}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">Output</span>
                            <div className="bg-[#070C15] border border-slate-900 rounded-lg px-4 py-3 font-mono text-sm text-slate-300">
                              {example.output}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#121826]/40 border border-slate-800/60 rounded-xl p-5 space-y-4 shadow-xl">
                  {/* Constraints Header */}
                  <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800/60 pb-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="font-sans font-bold text-xs uppercase tracking-widest">Constraints</h3>
                  </div>

                  {/* Simplified Bullet List Layout */}
                  <ul className="space-y-3 list-disc pl-5 font-sans text-sm text-slate-300">
                    {/* Dynamic array constraints text split into clean inline code pieces if provided */}
                    {problemData.constraints?.inputConstraints ? (
                      <li className="leading-relaxed marker:text-slate-500">
                        <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                          {problemData.constraints.inputConstraints}
                        </span>
                      </li>
                    ) : (
                      <>
                        {/* Fallback example markers if dynamic data isn't string-split yet */}
                        <li className="leading-relaxed marker:text-slate-500">
                          <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                            2 &lt;= nums.length &lt;= 10^4
                          </span>
                        </li>
                        <li className="leading-relaxed marker:text-slate-500">
                          <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                            -10^9 &lt;= nums[i] &lt;= 10^9
                          </span>
                        </li>
                      </>
                    )}
                    
                    {/* Meta Limits rendered cleanly as clean item specifications */}
                    <li className="leading-relaxed marker:text-slate-500">
                      Time Limit: <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">{problemData.constraints?.timeLimit || "2.0"}s</span>
                    </li>
                    <li className="leading-relaxed marker:text-slate-500">
                      Memory Limit: <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">{problemData.constraints?.memoryLimit || "256"}MB</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Reference Editorial Solutions */}
            {activeLeftTab === 'editorial' && (
  <div className="space-y-8 animate-in fade-in duration-200">
    
    {/* ======================================================== */}
    {/* 1. SECTION: VIDEO SOLUTIONS OVERVIEW                       */}
    {/* ======================================================== */}
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Video Walkthroughs
        </h3>
      </div>

                {solutionData.videoSolutions && solutionData.videoSolutions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                    {solutionData.videoSolutions.map((video, idx) => (
                        <div 
                        key={idx} 
                        className="group bg-[#121826]/70 backdrop-blur-sm rounded-xl border border-slate-800/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-500/40 hover:bg-[#161F30] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.15)] transition-all duration-200 ease-out"
                        >
                        <div className="flex items-center gap-4">
                            {/* Simulated Thumbnail Thumbnail Action Button */}
                            <div className="relative flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-[#070C15] border border-slate-800 overflow-hidden group-hover:border-indigo-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                                <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                            </div>
                            <div>
                            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                                {video.title || `Video Explanation Tutorial #${idx + 1}`}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                Instructor: <span className="text-indigo-400 font-semibold">{video.author || "Zcode Staff"}</span>
                            </p>
                            </div>
                        </div>
                        
                        <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full sm:w-auto text-center rounded-xl bg-[#121826] border border-slate-800/60 hover:border-indigo-500/40 hover:bg-indigo-600 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white shadow-md transition-all duration-200"
                        >
                            Watch Stream
                        </a>
                        </div>
                    ))}
                    </div>
                ) : (
                    /* Video Fallback State Box */
                    <div className="group bg-[#121826]/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-800/80 p-6 text-center transition-all">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <span className="text-slate-500 italic text-xs block">No video tutorials deployed for this problem yet.</span>
                    </div>
                )}
                </div>

                {/* ======================================================== */}
                {/* 2. SECTION: TEXT SOLUTIONS & REFERENCE IMPLEMENTATIONS   */}
                {/* ======================================================== */}
                <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Official Reference Implementations
                    </h3>
                </div>

                {solutionData.officialReferenceSolutions && solutionData.officialReferenceSolutions.length > 0 ? (
                    <div className="space-y-6">
                    {solutionData.officialReferenceSolutions.map((sol, i) => (
                        <div 
                        key={i} 
                        className="group bg-[#121826]/50 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 space-y-3 shadow-lg hover:border-indigo-500/20 transition-all duration-200"
                        >
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                            Solution #{i + 1}
                            </div>
                            {sol.language && (
                            <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700/30 uppercase tracking-wider">
                                {sol.language}
                            </span>
                            )}
                        </div>
                        
                        <div className="relative rounded-lg overflow-hidden border border-slate-900 bg-[#070C15] group-hover:border-slate-800/80 transition-colors">
                            <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre selection:bg-indigo-500/40">
                            <code>{sol.code}</code>
                            </pre>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    /* Text Fallback State Box */
                    <div className="text-slate-500 italic text-xs py-4 bg-[#121826]/20 border border-slate-800/40 rounded-xl text-center">
                    No verified editorial solutions released yet.
                    </div>
                )}
                </div>

            </div>
            )}

            {/* Tab: Personal Compilation Submissions */}
            {activeLeftTab === 'my-submissions' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        My Submissions
                    </h3>
                    </div>

                    {/* Submission Cards Stack */}
                    <div className="flex flex-col gap-2.5">
                    {solutionData.mySolutions && solutionData.mySolutions.length > 0 ? (
                        solutionData.mySolutions.map((sub, index) => {
                        const isSelected = selectedSubmission?.submissionId === sub.submissionId;
                        return (
                            <div 
                            key={sub.submissionId || index}
                            onClick={() => setSelectedSubmission({ ...sub, author: 'Your Account Instance' })}
                            className={`group relative rounded-xl border p-4 flex items-center justify-between gap-4 transition-all duration-200 ease-out cursor-pointer shadow-lg ${
                                isSelected 
                                ? 'bg-[#161F30] border-indigo-500 shadow-[0_0_25px_-5px_rgba(79,70,229,0.2)]' 
                                : 'bg-[#121826]/70 backdrop-blur-sm border-slate-800/60 hover:border-slate-700 hover:bg-[#161F30] hover:shadow-black/20 hover:-translate-y-[1px]'
                            }`}
                            >
                            {/* Decorative Subtle Selection Indicator Light */}
                            {isSelected && (
                                <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-indigo-500 rounded-r-md shadow-[0_0_8px_#4f46e5]"></div>
                            )}

                            {/* Personal Account Instance Profile Layout */}
                            <div className="flex items-center gap-3 truncate">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors ${
                                isSelected 
                                    ? 'bg-indigo-950 text-indigo-400 border-indigo-500/30' 
                                    : 'bg-slate-900/60 text-slate-400 border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300'
                                }`}>
                                {/* Account Instance Identifier Glyph */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                </div>
                                
                                <div className="truncate space-y-0.5">
                                <div className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    Attempt #{index + 1}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/80"></span>
                                    {sub.submittedAt || "Verification Log Confirmed"}
                                </div>
                                </div>
                            </div>

                            {/* Structural Layout Badges */}
                            <div className="flex items-center gap-2 shrink-0">
                                {sub.eloChange !== undefined && (
                                  <span className={`font-mono text-[10px] font-bold uppercase rounded-md px-2.5 py-0.5 border ${
                                    sub.eloChange > 0 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                      : sub.eloChange < 0 
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                        : 'bg-slate-800/80 border-slate-700/30 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-300'
                                  }`}>
                                    {sub.eloChange > 0 ? `+${sub.eloChange}` : sub.eloChange}
                                  </span>
                                )}
                                <span className={`font-mono text-[10px] font-bold uppercase rounded-md px-2.5 py-0.5 border transition-all ${
                                isSelected
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                    : 'bg-slate-800/80 border-slate-700/30 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-300'
                                }`}>
                                {sub.language || 'cpp'}
                                </span>
                                
                                {/* Arrow Pointer feedback accent */}
                                <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor" 
                                className={`w-4 h-4 transition-all duration-200 ${
                                    isSelected 
                                    ? 'text-indigo-400 translate-x-0' 
                                    : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
                                }`}
                                >
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            </div>
                        );
                        })
                    ) : (
                        /* Empty Stack Fallback Layout Frame */
                        <div className="group bg-[#121826]/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-800/80 p-6 text-center transition-all">
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <span className="text-slate-500 italic text-xs block">Make submissions to see my submissions here.</span>
                        </div>
                    )}
                    </div>

                </div>
                )}

            {/* Tab: Peer Pipelines Global Submissions */}
            {activeLeftTab === 'peer-submissions' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        Peer Submissions
                    </h3>
                    </div>

                    {/* Submission Cards Stack */}
                    <div className="flex flex-col gap-2.5">
                    {solutionData.peerSolutions && solutionData.peerSolutions.length > 0 ? (
                        solutionData.peerSolutions.map((sub, index) => {
                        const isSelected = selectedSubmission?.submissionId === sub.submissionId;
                        return (
                            <div 
                            key={sub.submissionId || index}
                            onClick={() => setSelectedSubmission({ ...sub, author: sub.submittedBy })}
                            className={`group relative rounded-xl border p-4 flex items-center justify-between gap-4 transition-all duration-200 ease-out cursor-pointer shadow-lg ${
                                isSelected 
                                ? 'bg-[#161F30] border-indigo-500 shadow-[0_0_25px_-5px_rgba(79,70,229,0.2)]' 
                                : 'bg-[#121826]/70 backdrop-blur-sm border-slate-800/60 hover:border-slate-700 hover:bg-[#161F30] hover:shadow-black/20 hover:-translate-y-[1px]'
                            }`}
                            >
                            {/* Decorative Subtle Selection Indicator Light */}
                            {isSelected && (
                                <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-indigo-500 rounded-r-md shadow-[0_0_8px_#4f46e5]"></div>
                            )}

                            {/* Identity Matrix Meta Section */}
                            <div className="flex items-center gap-3 truncate">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors ${
                                isSelected 
                                    ? 'bg-indigo-950 text-indigo-400 border-indigo-500/30' 
                                    : 'bg-slate-900/60 text-slate-400 border-slate-800 group-hover:border-slate-700 group-hover:text-slate-300'
                                }`}>
                                {(sub.submittedBy || "AT").slice(0, 2).toUpperCase()}
                                </div>
                                
                                <div className="truncate space-y-0.5">
                                <div className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {sub.submittedBy || "Anonymous Terminal"}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse"></span>
                                    Instance Verification Cleared
                                </div>
                                </div>
                            </div>

                            {/* Structural Layout Badges */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`font-mono text-[10px] font-bold uppercase rounded-md px-2.5 py-0.5 border transition-all ${
                                isSelected
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                    : 'bg-slate-800/80 border-slate-700/30 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-300'
                                }`}>
                                {sub.language || 'cpp'}
                                </span>
                                
                                {/* Arrow Pointer feedback accent */}
                                <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor" 
                                className={`w-4 h-4 transition-all duration-200 ${
                                    isSelected 
                                    ? 'text-indigo-400 translate-x-0' 
                                    : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
                                }`}
                                >
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            </div>
                        );
                        })
                    ) : (
                        /* Empty Stack Fallback Layout Frame */
                        <div className="group bg-[#121826]/30 backdrop-blur-sm rounded-xl border border-dashed border-slate-800/80 p-6 text-center transition-all">
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <span className="text-slate-500 italic text-xs block">No submission are registered for this problem.</span>
                        </div>
                    )}
                    </div>

                </div>
                )}

          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#070C15] border-l border-slate-800/60 animate-in fade-in duration-200">
  
                {/* ======================================================== */}
                {/* STATIC HEADER: CODE TERMINAL HEADER                      */}
                {/* ======================================================== */}
                <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-[#0B111E] h-[57px] shrink-0">
                    <div className="flex items-center gap-2">
                    {/* Animated Matrix/Status Pulse Indicator */}
                    <span className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        selectedSubmission 
                        ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse' 
                        : 'bg-slate-700'
                    }`}></span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {selectedSubmission ? `Code Review // ${selectedSubmission.author}` : "Submission Details"}
                    </span>
                    </div>
                    
                    {selectedSubmission && (
                    <span className="rounded-md bg-[#121826] px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-slate-800 uppercase tracking-wider font-mono">
                        {selectedSubmission.language || 'cpp'}
                    </span>
                    )}
                </div>
                
                {/* ======================================================== */}
                {/* CODE INTERACTIVE CORE EDITORIAL RENDERING MATRIX          */}
                {/* ======================================================== */}
                <div className="flex-1 min-h-0 w-full relative bg-[#070C15]">
                    {selectedSubmission ? (
                    <div className="h-full pt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <Editor
                        height="100%"
                        theme="vs-dark"
                        language={selectedSubmission.language === 'javascript' ? 'javascript' : 'cpp'}
                        value={selectedSubmission.code}
                        options={{ 
                            readOnly: true, 
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            wordWrap: 'on',
                            padding: { top: 8, bottom: 8 },
                            renderLineHighlight: 'all',
                            backgroundColor: '#070C15'
                        }}
                        />
                    </div>
                    ) : (
                    /* ======================================================== */
                    /* EMPTY PLACEHOLDER MATRIX STATE                           */
                    /* ======================================================== */
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070C15] p-8 text-center animate-in fade-in duration-300">
                        <div className="group relative bg-[#121826]/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-800/80 p-8 max-w-xs flex flex-col items-center justify-center transition-all duration-300 hover:border-indigo-500/20">
                        
                        {/* Cybernetic Geometric Shield Glyph Decorator */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B111E] text-slate-500 border border-slate-800/80 mb-4 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                            </svg>
                        </div>
                        
                        <p className="text-slate-400 font-medium text-xs mb-1">
                            No submission selected
                        </p>
                        <p className="text-slate-500 italic text-[11px] leading-relaxed">
                            Select an submissions either from my-submissions or peer-submissions to check its details.
                        </p>
                        </div>
                    </div>
                    )}
                </div>

                </div>
      </main>
    </div>
  );
}