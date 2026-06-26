import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../../utils/axiosClient";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).trim(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["Season Update", "Patch Notes", "Maintenance", "General"]).default("General"),
  isPinned: z.coerce.boolean().default(false),
});

export default function UpdateAnnouncement() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(!location.state?.announcement);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: location.state?.announcement || {
      title: "",
      content: "",
      category: "General",
      isPinned: false
    }
  });

  useEffect(() => {
    // If state exists, we already have data, no need to fetch
    if (location.state?.announcement) return;

    // // Fallback: If user refreshed page, state is gone, fetch manually
    // const fetchAnnouncement = async () => {
    //   try {
    //     const res = await axiosClient.get(`/announcement/get/${aid}`);
    //     reset(res.data.announcement);
    //   } catch (err) {
    //     console.error("Failed to fetch announcement:", err);
    //     alert("Failed to load data. Redirecting...");
    //     navigate('/admin/showallannouncements');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchAnnouncement();
  }, [aid, reset, location.state, navigate]);

  const onSubmit = async (data) => {
    try {
      await axiosClient.put(`/announcement/update/${aid}`, data);
      alert("Announcement updated successfully!");
      navigate('/admin/showallannouncements');
    } catch (err) {
      console.error("Update failed:", err);
      alert("Error: " + (err.response?.data?.error || "Update failed"));
    }
  };

  if (loading) return <div className="p-10 text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Update Announcement</h2>
        
        {/* Fixed ID Display */}
        <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Announcement ID</label>
            <div className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 font-mono">
                {aid}
            </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Title</label>
            <input {...register("title")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Content</label>
            <textarea {...register("content")} rows={6} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500" />
            {errors.content && <p className="text-rose-400 text-xs mt-1">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Category</label>
              <select {...register("category")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none">
                <option value="General">General</option>
                <option value="Season Update">Season Update</option>
                <option value="Patch Notes">Patch Notes</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("isPinned")} className="rounded border-slate-700 bg-[#121826] text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-300">Pin Announcement</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}