import axiosClient from "../../utils/axiosClient";
import { useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";


export const announcementSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less")
    .trim(),
  content: z.string()
    .min(1, "Content is required"),
  category: z.enum(["Season Update", "Patch Notes", "Maintenance", "General"])
    .default("General"),
  isPinned: z.coerce.boolean().default(false),
});



export default function CreateAnnouncement() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "General",
      isPinned: false
    }
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/announcement/create', data);
      alert("Announcement published!");
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Error: " + (error.response?.data?.error || "Creation failed"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Create New Announcement</h2>
        
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
            {isSubmitting ? "Publishing..." : "Publish Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}