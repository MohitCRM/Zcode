import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../utils/axiosClient";

export default function ShowAllProblems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalpages: 1, hasNextPage: false, hasPrevPage: false });
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        // Define the function strictly INSIDE the effect
        const controller = new AbortController();

        const fetchProblems = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/problem/fetchallproblems`, {
                    params: { page: currentPage, limit: 9 },
                    signal: controller.signal // Link the request to the controller
                });
                
                setProblems(response.data.problems || []);
                setPagination(response.data.pagination || {});
            } catch (err) {
                // Ignore errors caused by aborting the request
                if (err.name !== 'CanceledError') {
                    console.error("Failed to fetch problems:", err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();

        // Cleanup: abort the request if the component re-renders or unmounts
        return () => controller.abort();
    }, [currentPage]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? Deleting this problem is permanent.")) return;
        try {
            await axiosClient.delete(`/problem/delete/${id}`);
            setProblems(problems.filter(p => p._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete problem.");
        }
    };

    if (loading) return <div className="text-slate-400 p-6">Loading problems...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Problem Management</h1>
                <button 
                    onClick={() => navigate('/admin/create-problem')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                    + Create Problem
                </button>
            </div>

            {problems.length === 0 ? (
                <div className="text-slate-500 text-center py-20 border border-dashed border-slate-800 rounded-xl">
                    No problems found.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {problems.map((problem) => (
                            <div key={problem._id} className="bg-[#121826] border border-slate-800 p-5 rounded-xl flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-white font-bold truncate">{problem.title}</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/admin/update-problem/${problem._id}`, { state: { problem } })} 
                                            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(problem._id)} 
                                            className="px-2 py-1 text-[10px] text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-xs line-clamp-2">{problem.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button 
                            disabled={!pagination.hasPrevPage}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <span className="text-slate-400 text-sm">Page {pagination.currentPage} of {pagination.totalpages}</span>
                        <button 
                            disabled={!pagination.hasNextPage}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}