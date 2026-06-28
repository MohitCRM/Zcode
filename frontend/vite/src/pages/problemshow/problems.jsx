import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import { useNavigate } from "react-router";

export default function Problems() {
  const [data, setdata] = useState({ 
    problems: [], 
    problemsSolved: [], 
    seasonId: '', 
    activePhase: '', 
    currentSeasonDay: null 
  });
  const [errorState, setErrorState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getproblems');
        setdata(data);
        setErrorState(null);
      } catch (err) {
        const msg = err.response?.data?.message || "Something went wrong";
        setErrorState(msg);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="bg-[#090D16] min-h-screen text-slate-200 antialiased relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

      <main className="mx-auto max-w-7xl px-6 py-12 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Problem Set
            <div className="flex gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                Rated Season {data.seasonId || "1"}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                {data.activePhase || "Loading..."}
              </span>
            </div>
          </h1>
          {/* The Day Counter */}
          {data.currentSeasonDay !== null && (
          <div className="text-3xl font-bold text-slate-500 border-l border-slate-800 pl-6">
              Day <span className="text-white">{data.currentSeasonDay}</span>
              </div>
            )}
        </div>
          {/* Conditional Content */}
            {errorState ? (
              <div className="bg-[#121826] border border-amber-500/20 p-12 rounded-2xl text-center flex flex-col items-center gap-4 shadow-2xl">
                <div className="text-4xl">🔓</div>
                <h2 className="text-xl font-bold text-white">Round Currently Closed</h2>
                <p className="text-slate-400 max-w-md">{errorState}</p>
                <button 
                  onClick={() => navigate('/dashboard/solutions')}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                >
                  Go to Solution Hub
                </button>
              </div>
            ) : (
              <>
        <div className="bg-[#121826]/40 border border-slate-800/40 rounded-xl px-6 py-3.5 grid grid-cols-[100px_1fr_200px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div className="text-center">Release Day</div>
          <div>Title</div>
          <div className="text-right">Stakes</div>
        </div>

        <div className="flex flex-col gap-y-2 mt-2.5">
          {data.problems?.map((prob) => {
            const isReleasedToday = prob.releaseDay === data.currentSeasonDay;
            const isLocked = prob.releaseDay > data.currentSeasonDay;
            const isSolved = data.problemsSolved.some(s => s._id === prob._id);

            return (
              <div 
                key={prob._id} 
                onClick={() => !isLocked && navigate(`/dashboard/problems/${prob._id}`)}
                className={`group backdrop-blur-sm rounded-xl border p-5 grid grid-cols-[100px_1fr_200px] gap-4 items-center shadow-lg transition-all 
                  ${isLocked 
                    ? 'opacity-50 cursor-not-allowed border-slate-800 bg-[#0C1220]' 
                    : 'cursor-pointer border-slate-800/60 hover:border-indigo-500/40 hover:bg-[#161F30] ' + 
                      (isReleasedToday ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-[#121826]/70')
                  }`}
              >
                <div className="flex justify-center">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isLocked ? 'bg-slate-900 text-slate-600' : 
                    isReleasedToday ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isLocked ? "LOCKED" : `Day ${prob.releaseDay}`}
                  </span>
                </div>

                <div className="font-medium text-slate-300 group-hover:text-white truncate flex items-center">
                  {isLocked ? "Locked Problem" : prob.title}
                  {isReleasedToday && (
                    <span className="ml-3 px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold uppercase">
                      New Today
                    </span>
                  )}
                  {isSolved && !isLocked && (
                    <span className="ml-2 text-emerald-500">✓</span>
                  )}
                </div>

                <div className="flex justify-end items-center gap-3 text-sm font-medium tracking-wide">
                  {!isLocked ? (
                    <>
                      <span className="text-emerald-400">+{prob.baseEloReward}</span>
                      <span className="text-slate-700">|</span>
                      <span className="text-rose-400">-{prob.penaltyWrongAnswer}</span>
                    </>
                  ) : (
                    <span className="text-slate-600">🔒</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
        )}
      </main>
    </div>
  );
}