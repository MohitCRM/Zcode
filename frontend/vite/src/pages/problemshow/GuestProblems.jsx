import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import { useNavigate } from "react-router";

export default function GuestProblems() {
  const [data, setData] = useState({
    problems: [],
    problemsSolved: [],
    pagination: {
      currentPage: 1,
      totalpages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const navigate = useNavigate();

  const fetchProblems = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/problem/guestfetchallproblems?page=${page}&limit=10`);
      setData(response.data);
      setErrorState(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load problems";
      setErrorState(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= data.pagination.totalpages) {
      fetchProblems(newPage);
    }
  };

  return (
    <div className="bg-[#090D16] min-h-screen text-slate-200 antialiased relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

      <main className="mx-auto max-w-7xl px-6 py-12 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Problem Set
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Explore all problems without season restrictions in Guest Mode.</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              Guest Sandbox
            </span>
          </div>
        </div>

        {errorState ? (
          <div className="bg-[#121826] border border-rose-500/20 p-8 rounded-xl text-center text-rose-400">
            {errorState}
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
             <span className="loading loading-spinner loading-lg text-indigo-500"></span>
          </div>
        ) : (
          <>
            <div className="bg-[#121826]/40 border border-slate-800/40 rounded-xl px-6 py-3.5 grid grid-cols-[80px_1fr_200px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="text-center">Season</div>
              <div>Title</div>
              <div className="text-right">Stakes</div>
            </div>

            <div className="flex flex-col gap-y-2 mt-2.5">
              {data.problems?.map((prob) => {
                const isSolved = data.problemsSolved.some(s => s._id === prob._id);

                return (
                  <div 
                    key={prob._id} 
                    onClick={() => navigate(`/dashboard/problems/${prob._id}`)}
                    className="group backdrop-blur-sm rounded-xl border p-5 grid grid-cols-[80px_1fr_200px] gap-4 items-center shadow-lg transition-all cursor-pointer border-slate-800/60 hover:border-indigo-500/40 hover:bg-[#161F30] bg-[#121826]/70"
                  >
                    <div className="flex justify-center">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-400">
                        S{prob.seasonId || '?'}
                      </span>
                    </div>

                    <div className="font-medium text-slate-300 group-hover:text-white truncate flex items-center">
                      {prob.title}
                      {isSolved && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                          Solved
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end items-center gap-3 text-sm font-medium tracking-wide">
                      <span className="text-emerald-400">+{prob.baseEloReward}</span>
                      <span className="text-slate-700">|</span>
                      <span className="text-rose-400">-{prob.penaltyWrongAnswer}</span>
                    </div>
                  </div>
                );
              })}
              
              {data.problems?.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  No problems found.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {data.pagination?.totalpages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button 
                  onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                  disabled={!data.pagination.hasPrevPage}
                  className="px-4 py-2 rounded-lg bg-[#121826] border border-slate-700 text-slate-300 hover:bg-[#161F30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-400">
                  Page <span className="text-white">{data.pagination.currentPage}</span> of {data.pagination.totalpages}
                </span>
                <button 
                  onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                  disabled={!data.pagination.hasNextPage}
                  className="px-4 py-2 rounded-lg bg-[#121826] border border-slate-700 text-slate-300 hover:bg-[#161F30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
