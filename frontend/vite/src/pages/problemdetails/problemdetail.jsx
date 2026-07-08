import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from "../../utils/axiosClient";
import { updateChatHistory } from '../../slicers/chataiSlice';
import { updateCode } from '../../slicers/editorSlice';

const langAliases = {
  cpp: ['c++', 'cpp', 'cplusplus'],
  java: ['java'],
  javascript: ['javascript', 'js']
};

const formatExampleData = (dataString) => {
  if (!dataString) return dataString;
  try {
    const parsed = typeof dataString === 'string' ? JSON.parse(dataString) : dataString;
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .map(([key, value]) => {
          let valStr = JSON.stringify(value);
          if (Array.isArray(value)) {
            valStr = valStr.replace(/,/g, ', ');
          }
          return `${key} = ${valStr}`;
        })
        .join(', ');
    }
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed).replace(/,/g, ', ');
    }
    return String(parsed);
  } catch (e) {
    return typeof dataString === 'object' ? JSON.stringify(dataString) : dataString;
  }
};

const findStartCode = (startcodeArray, selectedLang) => {
  if (!startcodeArray || !Array.isArray(startcodeArray)) return null;
  const allowedAliases = langAliases[selectedLang] || [];
  return startcodeArray.find(sc => {
    if (!sc || !sc.language) return false;
    const itemLang = sc.language.toLowerCase().trim();
    return allowedAliases.includes(itemLang);
  });
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [isReleaseDay, setIsReleaseDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { histories } = useSelector((state) => state.chatai);
  const chatHistory = histories[problemId] || [];

  const { codes } = useSelector((state) => state.editor);

  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [wrongSubmissions, setWrongSubmissions] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const endpoint = user?.role === 'guest' 
          ? `/problem/guestgetproblembyid/${problemId}`
          : `/problem/getproblembyid/${problemId}`;
        const response = await axiosClient.get(endpoint);
        const { problem, today, wrongSubmissionsCount } = response.data;
        
        const startCodes = problem?.startcode || [];
        const match = findStartCode(startCodes, selectedLanguage);
        const initialCode = match ? match.initialcode : "// Write your C++ solution here";

        setProblem(problem);
        
        const existingCode = codes[problemId]?.[selectedLanguage];
        if (existingCode !== undefined) {
          setCode(existingCode);
        } else {
          setCode(initialCode);
          dispatch(updateCode({ problemId, language: selectedLanguage, code: initialCode }));
        }

        setIsReleaseDay(today);
        setWrongSubmissions(wrongSubmissionsCount || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, user?.role]);

  useEffect(() => {
    if (problem) {
      const existingCode = codes[problemId]?.[selectedLanguage];
      if (existingCode !== undefined) {
        setCode(existingCode);
      } else {
        const match = findStartCode(problem.startcode, selectedLanguage);
        const initialCode = match ? match.initialcode : '';
        setCode(initialCode);
        dispatch(updateCode({ problemId, language: selectedLanguage, code: initialCode }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    dispatch(updateCode({ problemId, language: selectedLanguage, code: newCode }));
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submit/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        error: error.response?.data?.error || 'Internal server error',
        passed: 0,
        totalTestCases: 0
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submit/submitproblem/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        status: "System Error",
        errorMessage: error.response?.data?.error || 'Internal server error',
        passedTestCases: 0,
        totalTestCases: 0,
        eloChange: 0
      });
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  useEffect(() => {
    if (submitResult && submitResult.status && submitResult.status !== 'Accepted' && submitResult.status !== 'Pending') {
      setWrongSubmissions(prev => prev + 1);
    }
  }, [submitResult]);

  useEffect(() => {
    if (activeLeftTab === 'askzai' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeLeftTab]);

  const handleAskZAi = async (e) => {
    e?.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    const userMessage = { role: 'user', text: aiQuery };
    const updatedHistory = [...chatHistory, userMessage];
    dispatch(updateChatHistory({ problemId, history: updatedHistory }));
    setAiQuery('');
    setAiLoading(true);

    try {
      const response = await axiosClient.post('/ai/problemchatai', {
        problemId,
        userCode: code,
        chatHistory: updatedHistory,
        language: selectedLanguage,
        newQuestion: aiQuery
      });

      dispatch(updateChatHistory({
        problemId,
        history: [
          ...updatedHistory,
          { role: 'model', text: response.data.reply }
        ]
      }));
    } catch (error) {
      console.error("AI Error:", error);
      dispatch(updateChatHistory({
        problemId,
        history: [
          ...updatedHistory,
          { role: 'model', text: error.response?.data?.reply || "I'm having trouble connecting right now. Please try again." }
        ]
      }));
    } finally {
      setAiLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'cpp';
    }
  };

  if (loading && !problem) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#090D16] text-slate-200 antialiased overflow-hidden">
      
      {/* Top Header Breadcrumb */}
      <header className="border-b border-slate-800/80 bg-[#0C1220] px-6 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          ← Back
        </button>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        
        {/* ================= LEFT SIDE PANEL ================= */}
        <div className="w-1/2 flex flex-col border-r border-slate-800/80 bg-[#0A0E1A]">

          {/* Left Panel Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar bg-[#090D16] border-b border-slate-800/80">
              {['description', 'askzai'].map((tab) => {
                const isZAiLocked = tab === 'askzai' && wrongSubmissions === 0;
                const isActive = activeLeftTab === tab;
                
                return (
                  <button
                    key={tab}
                    className={`flex items-center justify-center px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${
                      isActive 
                        ? 'border-indigo-500 text-indigo-400 bg-[#161F30]' 
                        : isZAiLocked 
                          ? 'border-transparent text-slate-600 cursor-not-allowed'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#161F30]/50'
                    }`}
                    onClick={() => {
                      if (!isZAiLocked) setActiveLeftTab(tab);
                    }}
                    title={isZAiLocked ? "Submit a failed attempt to unlock ZAi" : ""}
                  >
                    {tab === 'description' ? 'Description' : isZAiLocked ? 'Ask ZAi 🔒' : 'Ask ZAi '}
                  </button>
                );
              })}
            </div>

          {/* Left Content Area - Description */}
          {activeLeftTab === 'description' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {problem && (
              <>
                {/* Header Title Block */}
                <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{problem.title}</h1>
                    
                    {/* Special Themed Badges Placement */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Honoured One Style Badge for Current Season Day */}
                      <span className="bg-[#1e1430] border border-[#3c245c] text-[#c084fc] font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Day {problem.releaseDay}
                      </span>

                      {/* Monarch Style Gold Badge for Release Day Bonus */}
                      {isReleaseDay && (
                        <span className="bg-[#2a1f0a] border border-[#543d12] text-[#f59e0b] font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Release Day: 30% Bonus
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stakes Box Widget matching design images */}
                  <div className="bg-[#121826] border border-slate-800 rounded-xl px-5 py-2.5 flex items-center gap-5 shrink-0 shadow-sm font-sans">
                    {/* Reward Column */}
                    <div className="text-center min-w-[60px]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reward</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        +{problem.baseEloReward || 100}
                      </div>
                    </div>

                    {/* Vertical Divider Line */}
                    <div className="w-px h-8 bg-slate-800/80 self-center"></div>

                    {/* Penalty Column */}
                    <div className="text-center min-w-[60px]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Penalty</div>
                      <div className="text-lg font-bold text-rose-500 mt-0.5">
                        -{problem.penaltyWrongAnswer || 10}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Text Panel (Highly visible, generous tracking & line-height spacing) */}
                <div className="text-base text-slate-200 font-sans tracking-wide leading-relaxed selection:bg-indigo-500/30">
                  {problem.description}
                </div>

                {/* Styled Test Cases Block */}
                <div className="space-y-6 pt-4 border-t border-slate-800/60">
                  {/* Header Section Title */}
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2zm0 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2z" />
                    </svg>
                    <h3 className="font-sans font-black text-slate-100 text-base tracking-wider uppercase">
                      Test Cases
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    {problem.visibleTestCases?.map((example, index) => (
                      <div key={index} className="space-y-2.5">
                        {/* Example X heading in bold uppercase text */}
                        <h4 className="font-sans font-extrabold text-slate-400 text-xs tracking-wider uppercase">
                          Example {index + 1}:
                        </h4>
                        
                        {/* Clean transparent wrapper box with internal vertical margins */}
                        <div className="bg-[#121826]/30 border border-slate-800/60 rounded-xl p-5 space-y-4">
                          
                          {/* Input Parameter Mapping Box */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                              Input
                            </span>
                            <div className="bg-[#070C15] border border-slate-900 rounded-lg px-4 py-3 font-mono text-sm text-slate-300 leading-normal">
                              {formatExampleData(example.input)}
                            </div>
                          </div>

                          {/* Output Parameter Mapping Box */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                              Output
                            </span>
                            <div className="bg-[#070C15] border border-slate-900 rounded-lg px-4 py-3 font-mono text-sm text-slate-300 leading-normal">
                              {formatExampleData(example.output)}
                            </div>
                          </div>

                          {/* Context Explanation text */}
                          {example.explanation && (
                            <div className="text-slate-400 text-xs font-sans pt-1 leading-relaxed">
                              <span className="font-semibold text-slate-500">Explanation:</span> {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Styled Constraints Card */}
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
                    {problem.constraints?.inputConstraints ? (
                      <li className="leading-relaxed marker:text-slate-500">
                        <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">
                          {problem.constraints.inputConstraints}
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
                      Time Limit: <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">{problem.constraints?.timeLimit || "2.0"}s</span>
                    </li>
                    <li className="leading-relaxed marker:text-slate-500">
                      Memory Limit: <span className="font-mono bg-[#161F30] border border-slate-800/60 text-slate-200 px-1.5 py-0.5 rounded text-xs">{problem.constraints?.memoryLimit || "256"}MB</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
          )}

          {/* Left Content Area - Ask ZAi */}
          {activeLeftTab === 'askzai' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0A0E1A]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full pt-8 pb-4">
                    {/* Header Area */}
                    <div className="flex flex-col items-center space-y-4 mb-10">
                      {/* Avatar */}
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#090D16] border border-slate-800 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20"></div>
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400 relative z-10 font-sans">Z</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-white tracking-tight">Ask Z anything</h2>
                        <p className="text-slate-400 text-xs">Hints, explanations, strategy — no spoilers.</p>
                      </div>
                    </div>

                    {/* Intro Bubble */}
                    <div className="w-full mt-auto">
                      <div className="flex items-end gap-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 shadow-sm border border-indigo-500/30">
                          <span className="text-xs font-bold text-indigo-400 font-sans">Z</span>
                        </div>
                        <div className="bg-[#161F30] border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed text-slate-300 shadow-sm">
                          Hey there 👋 I'm Z — your mindful coding guide. I'm here to help you think through problems, understand concepts, and sharpen your approach. Ask me anything to get started.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className="w-full mb-6">
                      {msg.role === 'user' ? (
                        <div className="flex justify-end w-full">
                          <div className="max-w-[80%] rounded-3xl px-5 py-3.5 bg-[#1E293B] text-slate-200 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                            {msg.text}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4 w-full">
                          <div className="flex h-4 w-4 mt-0.5 shrink-0 items-center justify-center rounded bg-indigo-500/20 shadow-sm border border-indigo-500/30">
                            <span className="text-[10px] font-bold text-indigo-400 font-sans tracking-tighter">Z</span>
                          </div>
                          <div className="flex-1 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pt-2">
                            {msg.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="flex items-center gap-4 w-full mb-6">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-indigo-500/20 shadow-sm border border-indigo-500/30">
                      <span className="text-[10px] font-bold text-indigo-400 font-sans tracking-tighter">Z</span>
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              {/* Chat Input */}
              <div className="p-4 bg-[#0C1220] border-t border-slate-800/80 shrink-0">
                <form onSubmit={handleAskZAi} className="flex gap-2">
                  <input 
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask ZAi for a hint..."
                    className="flex-1 bg-[#121826] border border-slate-800 text-sm rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 placeholder-slate-600"
                    disabled={aiLoading}
                  />
                  <button 
                    type="submit"
                    disabled={aiLoading || !aiQuery.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE PANEL ================= */}
        <div className="w-1/2 flex flex-col bg-[#070B12]">
          {/* Layout Tab Switchers */}
          <div className="flex bg-[#0C1220] border-b border-slate-800/80 p-2 justify-between items-center shrink-0">
            <div className="flex bg-[#121826] p-1 rounded-lg border border-slate-800/40">
              {['code', 'testcase', 'result'].map((tab) => (
                <button 
                  key={tab}
                  className={`text-xs font-medium px-4 py-1 rounded-md transition-all ${
                    activeRightTab === tab 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveRightTab(tab)}
                >
                  {tab === 'code' ? 'Code' : tab === 'testcase' ? 'Testcases' : 'Result'}
                </button>
              ))}
            </div>

            {/* Language Selector Dropdown */}
            {activeRightTab === 'code' && (
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#121826] border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 outline-none focus:border-indigo-500/50 cursor-pointer font-mono mr-2"
              >
                <option value="cpp">C++</option>
              </select>
            )}
          </div>

          {/* Dynamic Window Area */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            
            {/* Tab: CODE EXECUTION */}
            {activeRightTab === 'code' && (
              <div className="flex-1 min-h-0 w-full pt-2">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'line',
                    readOnly: false,
                  }}
                />
              </div>
            )}

            {/* Tab: TEST CASES PANEL */}
            {activeRightTab === 'testcase' && (
              <div className="flex-1 p-5 overflow-y-auto font-sans text-xs space-y-5">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2zm0 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4zm0 6c-3.87 0-7-1.34-7-2s3.13-2 7-2 7 1.34 7 2-3.13 2-7 2z" />
                  </svg>
                  <h3 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                    Run Output
                  </h3>
                </div>

                {runResult ? (
                  <div className="space-y-4">
                    {/* Execution Overview Alert Bar */}
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                      runResult.error || runResult.passed !== runResult.totalTestCases
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <span className="text-lg">
                        {runResult.error || runResult.passed !== runResult.totalTestCases ? "❌" : "✅"}
                      </span>
                      <div className="font-sans">
                        <h4 className="font-bold text-sm text-white">
                          {runResult.error 
                            ? "Execution Failed" 
                            : runResult.passed === runResult.totalTestCases 
                              ? "All Test Cases Passed" 
                              : "Some Test Cases Failed"}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {runResult.error 
                            ? "An error occurred during runtime compilation." 
                            : `Passed ${runResult.passed} out of ${runResult.totalTestCases} Visible test cases.`}
                        </p>
                      </div>
                    </div>

                    {/* Individual Diagnostic Items */}
                    {runResult.error ? (
                      <div className="bg-[#0C1220] border border-slate-800/80 p-4 rounded-xl font-mono text-sm text-rose-400 whitespace-pre-wrap leading-relaxed">
                        {runResult.error}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {runResult.results?.map((tc, i) => {
                          const isSuccess = tc.status === 'Success';
                          return (
                            <div key={i} className="group relative bg-[#121826]/40 hover:bg-[#161F30]/60 border border-slate-800/60 rounded-xl p-4 transition-all duration-200">
                              {/* Vertical Status Accent Tag Line */}
                              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                                isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
                              }`} />
                              
                              <div className="pl-2 space-y-3">
                                {/* Header line containing identity index counter & status badge */}
                                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                                  <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                                    Case {i + 1}
                                  </span>
                                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    isSuccess 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {tc.status}
                                  </span>
                                </div>

                                {/* Aligned functional test criteria values layout block */}
                                <div className="space-y-2.5 text-slate-300">
                                  <div className="grid grid-cols-[80px_1fr] items-start gap-2">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pt-1">Input</span>
                                    <div className="bg-[#070C15] border border-slate-900 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300">
                                      {formatExampleData(tc.input)}
                                    </div>
                                  </div>

                                  {tc.expected && (
                                    <div className="grid grid-cols-[80px_1fr] items-start gap-2">
                                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pt-1">Expected</span>
                                      <div className="bg-[#070C15] border border-slate-900 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300">
                                        {formatExampleData(tc.expected)}
                                      </div>
                                    </div>
                                  )}

                                  {tc.actual && (
                                    <div className="grid grid-cols-[80px_1fr] items-start gap-2">
                                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pt-1">Actual</span>
                                      <div className={`bg-[#070C15] border rounded-lg px-3 py-1.5 font-mono text-xs ${
                                        isSuccess ? 'border-slate-900 text-slate-300' : 'border-rose-500/20 text-rose-400'
                                      }`}>
                                        {formatExampleData(tc.actual)}
                                      </div>
                                    </div>
                                  )}

                                  {tc.stderr && (
                                    <div className="grid grid-cols-[80px_1fr] items-start gap-2 pt-1">
                                      <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest pt-1">Stderr</span>
                                      <div className="bg-rose-950/10 border border-rose-500/20 rounded-lg px-3 py-2 font-mono text-xs text-rose-400 whitespace-pre-wrap">
                                        {tc.stderr}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#121826]/20 border border-slate-800/40 rounded-xl p-8 text-center text-slate-500 italic">
                    Hit run to see the results of visible test cases
                  </div>
                )}
              </div>
            )}

            {/* Tab: SUBMISSION EVALUATION MATRIX */}
            {/* Tab: SUBMISSION EVALUATION MATRIX */}
      {activeRightTab === 'result' && (
        <div className="flex-1 p-5 overflow-y-auto font-sans text-xs space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
              Final Evaluation Details
            </h3>
          </div>

          {submitResult ? (
            <div className="space-y-4">
              {/* Dynamic Theme Banner Based on Backend Status */}
              {(() => {
                const isAccepted = submitResult.status === 'Accepted';
                const isPending = submitResult.status === 'Pending';
                
                let bannerStyles = 'bg-rose-500/5 border-rose-500/20 text-rose-400';
                let statusIcon = '❌';
                
                if (isAccepted) {
                  bannerStyles = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
                  statusIcon = '🎉';
                } else if (isPending) {
                  bannerStyles = 'bg-amber-500/5 border-amber-500/20 text-amber-400';
                  statusIcon = '⏳';
                }

                return (
                  <div className={`p-5 rounded-xl border flex items-start gap-4 shadow-lg ${bannerStyles}`}>
                    <span className="text-2xl mt-0.5">{statusIcon}</span>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-base font-black text-white tracking-tight">
                        Verification Complete: {submitResult.status}
                      </h4>
                      <p className="text-slate-400 text-xs font-medium max-w-md">
                        {submitResult.errorMessage
                          ? submitResult.errorMessage
                          : isAccepted 
                          ? "All test cases including hidden system tests have passed."
                          : "Code failed to run the test cases."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Diagnostic Metrics Matrix Panel */}
                      <div className="bg-[#121826]/40 border border-slate-800/60 rounded-xl p-5 space-y-4 shadow-xl">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/60 pb-2">
                          Execution Summary Statistics
                        </div>

                        <div className="space-y-3.5 font-sans text-sm text-slate-300">
                          {/* Test Case Breakdown Metric */}
                          <div className="flex justify-between items-center border-b border-slate-800/40 pb-2.5">
                            <span className="text-slate-400 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                              🎯 Verification Checks
                            </span>
                            <span className="font-mono font-bold text-slate-100 bg-[#161F30] border border-slate-800/60 px-2 py-0.5 rounded text-xs">
                              {submitResult.passedTestCases} / {submitResult.totalTestCases} Passed
                            </span>
                          </div>

                          {/* Live Elo Change Event Metrics Badge */}
                          <div className="flex justify-between items-center pt-0.5">
                            <span className="text-slate-400 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                              ⚡ Rating Impact
                            </span>
                            <div>
                              {submitResult.eloChange > 0 ? (
                                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded text-xs">
                                  +{submitResult.eloChange} Elo Rating Bonus
                                </span>
                              ) : submitResult.eloChange < 0 ? (
                                <span className="font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded text-xs">
                                  {submitResult.eloChange} Elo Penalty Deducted
                                </span>
                              ) : (
                                <span className="font-mono font-bold text-slate-400 bg-slate-800/60 border border-slate-700/40 px-2.5 py-0.5 rounded text-xs">
                                  0 Elo (Already Solved)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#121826]/20 border border-slate-800/40 rounded-xl p-8 text-center text-slate-500 italic">
                      Hit submit to know the result here
                    </div>
                  )}
                </div>
              )}
                </div>

          {/* Bottom Action Footer Bar */}
          <div className="bg-[#0C1220] border-t border-slate-800/80 px-6 py-3.5 flex items-center justify-between shrink-0">
            <button 
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              onClick={() => setActiveRightTab('testcase')}
            >
              Console Logs
            </button>
            <div className="flex gap-3">
              <button
                className={`bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleRun}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Run'}
              </button>
              <button
                className={`bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSubmitCode}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProblemPage;