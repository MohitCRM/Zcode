import { useEffect, useState } from "react";
import axiosClient from "../../utils/axiosClient";
import { format } from "date-fns";

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await axiosClient.get("/announcement/all");
                setAnnouncements(response.data.announcements);
            } catch (err) {
                console.error("Failed to load:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="min-h-screen bg-[#090D16] text-slate-200 p-6 md:p-12">
            {/* Background Mesh Effect */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

            <main className="relative z-10 mx-auto max-w-4xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        Platform Announcements
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">Updates</span>
                    </h1>
                    <p className="mt-2 text-slate-400 text-sm">Stay informed about new features, maintenance, and seasonal changes.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => <div key={i} className="h-32 rounded-xl bg-[#121826]/50 animate-pulse border border-slate-800"></div>)}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {announcements.map((ann) => (
                            <div 
                                key={ann._id} 
                                className={`group rounded-xl border p-6 bg-[#121826]/70 backdrop-blur-sm transition-all duration-200 
                                ${ann.isPinned ? 'border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.1)]' : 'border-slate-800/60 hover:border-slate-700'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {ann.isPinned && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                                                📌 Pinned
                                            </span>
                                        )}
                                        <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/30">
                                            {ann.category}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-600 font-mono">
                                        {format(new Date(ann.createdAt), 'MMM dd, yyyy')}
                                    </span>
                                </div>

                                <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                    {ann.title}
                                </h2>
                                
                                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                                    {ann.content}
                                </p>

                                <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center gap-2 text-xs text-slate-500">
                                    <span>Posted by</span>
                                    <span className="font-medium text-slate-300">
                                        {ann.author.firstName} {ann.author.lastName}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}