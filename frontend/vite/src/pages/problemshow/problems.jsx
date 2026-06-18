import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";

export default function Problems() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getproblems');
        setProblems(data);
      } catch (err) {
        console.error('Error fetching problems:', err);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="bg-[#090D16] min-h-screen text-slate-200 antialiased relative overflow-x-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

      <main className="mx-auto max-w-7xl px-6 py-12 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Problem Set
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
              Rated Season 1
            </span>
          </h1>
        </div>

        {/* Table Header */}
        <div className="bg-[#121826]/40 border border-slate-800/40 rounded-xl px-6 py-3.5 grid grid-cols-[70px_1fr_180px_220px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div className="text-center">Status</div>
          <div>Title</div>
          <div>Difficulty & Stakes</div>
          <div>Tags</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-y-2 mt-2.5">
          {problems.map((prob, index) => (
            <div 
              key={prob._id} 
              className="group bg-[#121826]/70 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 grid grid-cols-[70px_1fr_180px_220px] gap-4 items-center shadow-lg hover:border-indigo-500/40 hover:bg-[#161F30] transition-all cursor-pointer"
            >
              {/* Status Indicator */}
              <div className="flex justify-center">
                {prob.solved ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-dashed border-slate-700 group-hover:border-slate-500"></div>
                )}
              </div>

              {/* Title */}
              <div className="font-medium text-slate-300 group-hover:text-white truncate">
                <span className="text-slate-600 mr-1.5">{index + 1}.</span> {prob.title}
              </div>

              {/* Difficulty & Elo */}
              <div className="flex flex-col gap-1">
                <span className={`inline-flex w-fit items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold border ${
                  prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {prob.difficulty}
                </span>
                <div className="text-[11px] font-medium tracking-wide flex items-center gap-1.5">
                  <span className="text-emerald-400">+{prob.baseEloReward}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-rose-400">-{prob.penaltyWrongAnswer} Elo</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {prob.tags?.map(tag => (
                  <span key={tag} className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-700/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}