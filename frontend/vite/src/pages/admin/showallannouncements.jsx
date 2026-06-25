import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../utils/axiosClient";

export default function ShowAllAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getAnnouncements = async () => {
            try {
                const response = await axiosClient.get('/announcement/all');
                setAnnouncements(response.data.announcements);
            } catch (err) {
                console.error("Failed to fetch announcements:", err.message);
            }
        };
        getAnnouncements();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await axiosClient.delete(`/announcement/delete/${id}`);
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Announcements</h1>
                <button 
                    onClick={() => navigate('/admin/create-announcement')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                    + Create Announcement
                </button>
            </div>

            <div className="grid gap-4">
                // Inside the map function of ShowAllAnnouncements.js
{announcements.map((ann) => (
    <div key={ann._id} className="bg-[#121826] border border-slate-800 p-5 rounded-xl flex justify-between items-start">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                {ann.isPinned && (
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                        Pinned
                    </span>
                )}
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                    {ann.category}
                </span>
            </div>
            <h3 className="text-white font-semibold text-lg">{ann.title}</h3>
            <p className="text-slate-400 text-sm mt-1">{ann.content}</p>
            <p className="text-[10px] text-slate-600 mt-3 italic">
                Posted on {new Date(ann.createdAt).toLocaleDateString()}
            </p>
        </div>
        
        <div className="flex gap-2 ml-4">
            <button onClick={() => navigate(`/admin/update-announcement/${ann._id}`)} className="text-slate-400 hover:text-white">Update</button>
            <button onClick={() => handleDelete(ann._id)} className="text-rose-500 hover:text-rose-400">Delete</button>
        </div>
    </div>
))}
            </div>
        </div>
    );
}