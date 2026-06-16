import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {z} from 'zod';
import axiosClient from "../../utils/axiosClient";

const seasonschema = z.object({
  seasonId: z.number().int().positive("Season ID must be a positive integer"),
  isActive: z.boolean().default(false),
  
  launchDate: z.coerce.date(),
  
  round1Start: z.coerce.date(),
  round1End: z.coerce.date(),
  
  r1SolutionStart: z.coerce.date(),
  r1SolutionEnd: z.coerce.date(),
  
  round2Start: z.coerce.date(),
  round2End: z.coerce.date(),
  
  r2SolutionStart: z.coerce.date(),
  r2SolutionEnd: z.coerce.date(),
}).refine((data) => data.round1End > data.round1Start, {
  message: "Round 1 End date must be after Start date",
  path: ["round1End"],
}).refine((data) => data.r1SolutionEnd > data.r1SolutionStart, {
  message: "Round 1 Solution End date must be after Start date",
  path: ["r1SolutionEnd"],
});

const onSubmit = async (data) => {
    try {
        const response = await axiosClient.post('/seasons/create', data);
        
        if (response.status === 201) {
            alert("Season created successfully!");
            // navigate('/admin'); 
        }
    } catch (err) {
        console.error("Submission failed:", err.response?.data?.message || err.message);
        alert(err.response?.data?.message || "Failed to create season");
    }
}

export default function CreateSeason() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(seasonschema)
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Season</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Season ID & Active Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Season ID</label>
              <input 
                {...register("seasonId", { valueAsNumber: true })}
                className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                placeholder="e.g. 1"
              />
              {errors.seasonId && <p className="text-rose-500 text-xs mt-1">{errors.seasonId.message}</p>}
            </div>
            
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" {...register("isActive")} className="accent-indigo-600 w-5 h-5" />
              <label className="text-sm font-medium text-slate-300">Set as Active</label>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Create Season
          </button>
        </form>
      </div>
    </div>
  );
}