import { useState, useEffect } from "react";
import axiosClient from "../../utils/axiosClient";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

export default function Standings() {
    const [seasons, setSeasons] = useState([]);
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { data: currentSeason } = useSelector(state => state.season);

    useEffect(() => {

        if (user?.role === 'guest' && currentSeason?._id) {
            navigate(`/dashboard/standings/${currentSeason._id}`, { replace: true });
            return;
        }
        const fetchSeasons = async () => {
            try {
                // Ensure your backend endpoint returns the seasons array
                const response = await axiosClient.get('/seasons/getallseasons');
                console.log(response.data.seasons)
                setSeasons(response.data.seasons);
            } catch (err) {
                console.error("Failed to fetch seasons:", err);
            }
        };
        fetchSeasons();
    }, []);

    // Add this check inside your return statement, before the main div
    if (seasons.length === 0) {
        return (
            <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-500">
                Loading seasons...
            </div>
        );
    }

    return (
        // Adding min-h-screen and the dark background color here ensures 
        // the background covers the entire page, matching your other routes.
        <div className="min-h-screen bg-[#090D16] py-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Season Standings
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">View performance history and active seasonal rankings.</p>
                </div>

                <div className="flex flex-col gap-y-3 w-full">
                    {/* Header Row */}
                    <div className="bg-[#121826]/40 border border-slate-800/40 rounded-xl px-6 py-3.5 grid grid-cols-[1fr_200px_200px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <div>Season</div>
                        <div className="text-center">Status</div>
                        <div className="text-right">Ranking</div>
                    </div>

                    {/* Season Rows */}
                    {seasons.map((season) => (
                        <div
                            key={season.seasonId}
                            className="group bg-[#121826]/70 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 grid grid-cols-[1fr_200px_200px] gap-4 items-center shadow-lg hover:border-indigo-500/40 hover:bg-[#161F30] transition-all duration-200"
                        >
                            <div className="font-medium text-slate-300 group-hover:text-white transition-colors">
                                Season {season.seasonId}
                            </div>

                            <div className="flex justify-center">
                                {season.isActive ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                        Active
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Completed</span>
                                )}
                            </div>

                            <div onClick={() => navigate(`/dashboard/standings/${season._id}`)}
                                className="text-right text-sm text-slate-400 font-medium cursor-pointer hover:text-indigo-400 transition-colors">
                                View Stats →
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}