import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axiosClient from '../../utils/axiosClient';
import Editor from '@monaco-editor/react';
import axios from 'axios';

export default function Solution() {
    const { pid } = useParams();
    const [loading, setLoading] = useState(false);
    const [solutionData, setSolutionData] = useState(null);
    const [problemData, setProblemData] = useState(null);
    // UI State
    const [activeLeftTab, setActiveLeftTab] = useState('description'); // 'description', 'editorial', 'my-submissions', 'peer-submissions'
    const [activeRightTab,setActiveRightTab] = useState('chatAi');
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [solRes, probRes,subres] = await Promise.all([
                    axiosClient.get(`/solution/${pid}`),
                    axiosClient.get(`/problem/getproblembyid/${pid}`),
                    axiosClient.get(`/problem/submittedproblem/${pid}`)
                ]);
                setSolutionData(solRes.data.solutionData);
                setProblemData(probRes.data.problem);
                
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchData();
    }, [pid]);

    if (loading || !problemData || !solutionData) return <div className="text-white p-10">Loading...</div>;

    return (
        <div className="flex h-screen bg-[#090D16] text-slate-200 overflow-hidden">
            {/* Left Panel: Navigation & Content */}
            <div className="w-1/2 flex flex-col border-r border-slate-800">
                <div className="flex bg-[#0C1220] p-2 border-b border-slate-800 gap-1">
                    {['description', 'editorial', 'my-submissions', 'peer-submissions'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveLeftTab(tab)}
                            className={`px-4 py-2 text-xs font-semibold uppercase rounded-lg ${activeLeftTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeLeftTab === 'editorial' && solutionData && (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-300">
        {/* Video Section remains the same */}
        <div>
            <h2 className="text-xl font-bold text-white mb-4">Video Solution</h2>
            <div className="bg-[#121826] rounded-xl border border-slate-800 p-8 text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-semibold text-white">Subscribe to unlock</h3>
            </div>
        </div>

        <div className="h-px bg-slate-800"></div>

        {/* In-line Solution Section */}
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Official Solutions</h2>
            <div className="space-y-6">
                {solutionData.officialReferenceSolutions.map((sol, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                            {sol.language} Solution
                        </h3>
                        <div className="bg-[#0C1220] rounded-lg border border-slate-700 overflow-hidden">
                            <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                                <code>{sol.code}</code>
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)}
                    {activeLeftTab === 'description' && (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">{problemData.title}</h1>
            <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border 
                    ${problemData.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      problemData.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {problemData.difficulty}
                </span>
                <div className="flex gap-2">
                    {problemData.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-md bg-[#161F30] text-slate-400 text-xs font-medium border border-slate-700">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800"></div>

        {/* Main Content */}
        <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
            {problemData.description}
        </div>

        {/* Examples Section (Optional, based on your schema) */}
        {problemData.visibleTestCases && (
            <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-white">Examples</h3>
                {problemData.visibleTestCases.map((tc, i) => (
                    <div key={i} className="bg-[#121826] p-4 rounded-xl border border-slate-800">
                        <p className="font-bold text-white mb-2">Example {i + 1}</p>
                        <div className="text-xs font-mono space-y-1">
                            <p><span className="text-slate-500">Input:</span> {tc.input}</p>
                            <p><span className="text-slate-500">Output:</span> {tc.output}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
)}
                    {activeLeftTab === 'peer-submissions' && (
                        <div className="space-y-2">
                            {solutionData.peerSolutions.map(sub => (
                                <div 
                                    key={sub.submissionId}
                                    onClick={() => setSelectedSubmission({ ...sub, author: sub.submittedBy })}
                                    className="p-3 bg-[#121826] border border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500"
                                >
                                    <div className="text-sm font-bold text-white">{sub.submittedBy}</div>
                                    <div className="text-[10px] text-slate-500">{sub.language} • {new Date(sub.timestamp).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Code Viewer */}
            <div className="w-1/2 flex flex-col bg-[#0C1220]">
                {selectedSubmission ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-400">Solved by: {selectedSubmission.author}</span>
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded">{selectedSubmission.language}</span>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={selectedSubmission.language === 'cpp' ? 'cpp' : 'javascript'}
                                value={selectedSubmission.code}
                                options={{ readOnly: true, minimap: { enabled: false } }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-600 italic">
                        Select a submission to view the code.
                    </div>
                )}
            </div>
        </div>
    );
}