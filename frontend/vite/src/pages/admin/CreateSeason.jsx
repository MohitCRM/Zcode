import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {z} from 'zod';
import axiosClient from "../../utils/axiosClient";

const seasonschema = z.object({
  seasonId: z.number().int().positive("Season ID must be a positive integer"),
  isActive: z.boolean().default(false),
  isGuestSeason: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
  
  launchDate: z.string(),
  
  round1Start: z.string(),
  round1End: z.string(),
  
  r1SolutionStart: z.string(),
  r1SolutionEnd: z.string(),
  
  round2Start: z.string(),
  round2End: z.string(),
  
  r2SolutionStart: z.string(),
  r2SolutionEnd: z.string(),
}).refine((data) => data.round1End > data.round1Start, {
  message: "Round 1 End date must be after Start date",
  path: ["round1End"],
}).refine((data) => data.r1SolutionEnd > data.r1SolutionStart, {
  message: "Round 1 Solution End date must be after Start date",
  path: ["r1SolutionEnd"],
});



export default function CreateSeason() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(seasonschema)
  });

  const navigate = useNavigate();

const onSubmit = async (data) => {
  const formatIST = (dateStr) => new Date(dateStr + "+05:30").toISOString();
  const formattedData = {
        ...data,
        launchDate: formatIST(data.launchDate),
        round1Start: formatIST(data.round1Start),
        round1End: formatIST(data.round1End),
        r1SolutionStart: formatIST(data.r1SolutionStart),
        r1SolutionEnd: formatIST(data.r1SolutionEnd),
        round2Start: formatIST(data.round2Start),
        round2End: formatIST(data.round2End),
        r2SolutionStart: formatIST(data.r2SolutionStart),
        r2SolutionEnd: formatIST(data.r2SolutionEnd),
    };
    try {
        const response = await axiosClient.post('/seasons/create', formattedData);
        if (response.status === 201) {
            alert("Season created successfully!");
            navigate('/admin'); 
        }
    } catch (err) {
        console.error("Submission failed:", err.response?.data?.message || err.message);
        console.log("Submission failed:", err.response?.data?.message || err.message);
        alert(err.response?.data?.message || "Failed to create season");
    }
}
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Season</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Season ID & Active Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Season ID</label>
              <input 
                {...register("seasonId", { valueAsNumber: true })}
                className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                placeholder="e.g. 1"
              />
              {errors.seasonId && <p className="text-rose-500 text-xs mt-1">{errors.seasonId.message}</p>}
            </div>
            
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" {...register("isActive")} className="accent-indigo-600 w-5 h-5" />
              <label className="text-sm font-medium text-slate-300">Active</label>
            </div>
            
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" {...register("isGuestSeason")} className="accent-emerald-600 w-5 h-5" />
              <label className="text-sm font-medium text-slate-300">Guest</label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" {...register("isCompleted")} className="accent-slate-500 w-5 h-5" />
              <label className="text-sm font-medium text-slate-300">Completed</label>
            </div>
          </div>

          {/* Season Timeline */}
          <div className="space-y-4">
            <h3 className="block text-xs font-semibold text-slate-500 uppercase">Season Timeline</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Launch Date */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Launch Date</label>
                <input type="datetime-local" {...register("launchDate")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>

              {/* Rounds */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Round 1 Start</label>
                <input type="datetime-local" {...register("round1Start")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Round 1 End</label>
                <input type="datetime-local" {...register("round1End")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Solution 1 Start</label>
                <input type="datetime-local" {...register("r1SolutionStart")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Solution 1 End</label>
                <input type="datetime-local" {...register("r1SolutionEnd")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Round 2 Start</label>
                <input type="datetime-local" {...register("round2Start")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Round 2 End</label>
                <input type="datetime-local" {...register("round2End")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Solution 2 Start</label>
                <input type="datetime-local" {...register("r2SolutionStart")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Solution 2 End</label>
                <input type="datetime-local" {...register("r2SolutionEnd")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300" />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {isSubmitting ? "Creating..." : "Create Season"}
          </button>
        </form>
      </div>
    </div>
  );
}