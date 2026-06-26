import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../../utils/axiosClient";
import {z} from 'zod';

const jsonSchema = z.string().refine((val) => {
  try {
    JSON.parse(val);
    return true;
  } catch (e) {
    return false;
  }
}, { message: "Input must be valid JSON (e.g., [1, 2, 3] or { \"nums\": [1, 2] })" });

 const problemschema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string())
    .min(1, "At least one tag is required")
    .refine((items) => items.every(item => leetcodeTags.includes(item)), {
      message: "One or more selected tags are invalid",
    }),
    constraints: z.object({
    timeLimit: z.coerce.number().min(0.1).default(1.0),
    memoryLimit: z.coerce.number().min(64).default(256),
    inputConstraints: z.string().min(1, "Input constraints are required"),
  }),
  
  baseEloReward: z.coerce.number().min(0),
  penaltyWrongAnswer: z.coerce.number().min(0),
  penaltyTimeLimitExceeded: z.coerce.number().min(0),
  penaltyRuntimeError: z.coerce.number().min(0),
  penaltyCompilationError: z.coerce.number().min(0),
  
  seasonId: z.coerce.number().int().positive(),
  round: z.coerce.number().refine((val) => [1, 2].includes(val), {
    message: "Round must be 1 or 2",
  }),
  releaseDay: z.coerce.number().min(1).max(25),
  
  visibleTestCases: z.array(
    z.object({
      input: jsonSchema,
      output: jsonSchema,
      explanation: z.string().optional(),
    })
  ),
  drivercode : z.string().min(1,"Driver code is required"),
  
  hiddenTestCases: z.array(
    z.object({
      input: jsonSchema,
      output: jsonSchema,
    })
  ),
  
  startcode: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      initialcode: z.string().min(1, "Initial code is required"),
    })
  ),
  
  referencesolution: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      code: z.string().min(1, "Solution code is required"),
    })
  ),
});

const leetcodeTags = [
    "Array",
    "Backtracking",
    "Biconnected Component",
    "Binary Indexed Tree",
    "Binary Search",
    "Binary Search Tree",
    "Binary Tree",
    "Bit Manipulation",
    "Bitmask",
    "Brainteaser",
    "Breadth-First Search",
    "Bucket Sort",
    "Combinatorics",
    "Concurrency",
    "Counting",
    "Counting Sort",
    "Data Stream",
    "Database",
    "Depth-First Search",
    "Design",
    "Divide and Conquer",
    "Doubly-Linked List",
    "Dynamic Programming",
    "Enumeration",
    "Eulerian Circuit",
    "Game Theory",
    "Geometry",
    "Graph",
    "Greedy",
    "Hash Function",
    "Hash Table",
    "Heap (Priority Queue)",
    "Interactive",
    "Iterator",
    "Line Sweep",
    "Linked List",
    "Math",
    "Matrix",
    "Memoization",
    "Merge Sort",
    "Minimum Spanning Tree",
    "Monotonic Queue",
    "Monotonic Stack",
    "Number Theory",
    "Ordered Set",
    "Prefix Sum",
    "Probability and Statistics",
    "Queue",
    "Quickselect",
    "Radix Sort",
    "Randomized",
    "Recursion",
    "Rejection Sampling",
    "Reservoir Sampling",
    "Rolling Hash",
    "Segment Tree",
    "Shell",
    "Shortest Path",
    "Simulation",
    "Sliding Window",
    "Sorting",
    "Stack",
    "String",
    "String Matching",
    "Strongly Connected Component",
    "Suffix Array",
    "Topological Sort",
    "Tree",
    "Trie",
    "Two Pointers",
    "Union Find"
];

export default function UpdateProblem()
{
    const { pid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(!location.state?.problem);
    const [serverError, setServerError] = useState("");

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(problemschema),
        defaultValues: location.state?.problem || {}
    });


    const { fields: vtFields, append: appendVT, remove: removeVT } = useFieldArray({ control, name: "visibleTestCases" });
    const { fields: htFields, append: appendHT, remove: removeHT } = useFieldArray({ control, name: "hiddenTestCases" });
    const { fields: scFields, append: appendSC, remove: removeSC } = useFieldArray({ control, name: "startcode" });
    const { fields: rsFields, append: appendRS, remove: removeRS } = useFieldArray({ control, name: "referencesolution" });

    useEffect(() => {
    // If state exists, we are good. If not, fetch the data
    if (location.state?.problem) return;

    const fetchProblem = async () => {
      try {
        const res = await axiosClient.get(`/problem/getproblembyid/${pid}`);
        reset(res.data.problem);

        const sanitizedData = {
      ...data,
      visibleTestCases: data.visibleTestCases || [],
      hiddenTestCases: data.hiddenTestCases || [],
      startcode: data.startcode || [],
      referencesolution: data.referencesolution || [],
    };
    
    reset(sanitizedData);
      } catch (err) {
        setServerError("Failed to load problem data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [pid, reset, location.state]);

  const onSubmit = async (data) => {
    try {
      await axiosClient.put(`/problem/update/${pid}`, data);
      alert("Problem updated successfully!");
      navigate('/admin/showallproblems');
    } catch (err) {
      setServerError(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="p-10 text-slate-400">Loading...</div>;

    return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Update Problem</h2>
        
        {serverError && (
        <div className="mb-6 p-4 bg-rose-900/20 border border-rose-800 text-rose-400 rounded-xl text-sm">
          {serverError}
        </div>
      )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Title</label>
              <input {...register("title")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
              <textarea {...register("description")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none h-32" />
            </div>

            <div className="mb-6">
  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Tags</label>
  {/* Switch from grid to flex-wrap */}
  <div className="flex flex-wrap gap-x-6 gap-y-3 bg-[#121826] p-4 rounded-xl border border-slate-800 h-48 overflow-y-auto">
    {leetcodeTags.map((tag) => (
      <label key={tag} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white whitespace-nowrap">
        <input
          type="checkbox"
          value={tag}
          {...register("tags")}
          className="rounded border-slate-700 bg-[#0C1220] text-indigo-600 focus:ring-indigo-500"
        />
        {tag}
      </label>
    ))}
  </div>
  {errors.tags && <p className="text-rose-400 text-xs mt-1">{errors.tags.message}</p>}
</div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Season ID</label>
              <input type="number" {...register("seasonId", { valueAsNumber: true })} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>

            

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Round</label>
              <input type="number" {...register("round", { valueAsNumber: true })} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Difficulty</label>
              <select {...register("difficulty")} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Release Day</label>
              <input type="number" {...register("releaseDay", { valueAsNumber: true })} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>

        

          </div>

          {/* Penalties */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Penalties</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["baseEloReward", "penaltyWrongAnswer", "penaltyTimeLimitExceeded", "penaltyRuntimeError"].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">{field}</label>
                  <input type="number" {...register(field, { valueAsNumber: true })} className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
  {/* Visible Test Cases */}
<section>
  <h3 className="text-white font-semibold mb-3">Visible Test Cases</h3>
  {vtFields.map((field, index) => (
    <div key={field.id} className="grid grid-cols-4 gap-2 mb-2 items-center">
      <textarea 
        {...register(`visibleTestCases.${index}.input`)} 
        placeholder='{"list1": [1,2,4]}' 
        className="bg-[#121826] border border-slate-800 p-2 rounded text-indigo-300 font-mono text-xs min-h-[60px]" 
      />
      <textarea 
        {...register(`visibleTestCases.${index}.output`)} 
        placeholder='[1,1,2,3,4,4]' 
        className="bg-[#121826] border border-slate-800 p-2 rounded text-emerald-300 font-mono text-xs min-h-[60px]" 
      />
      <input {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="bg-[#121826] border border-slate-800 p-2 rounded text-white text-xs" />
      <button type="button" onClick={() => removeVT(index)} className="text-red-400 text-xs">Remove</button>
    </div>
  ))}
  <button type="button" onClick={() => appendVT({ input: "{}", output: "{}" })} className="text-indigo-400 text-sm">+ Add Visible Case</button>
</section>

  {/* Hidden Test Cases */}
<section>
  <h3 className="text-rose-400 font-semibold mb-3">Hidden Test Cases</h3>
  {htFields.map((field, index) => (
    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-slate-800 rounded-xl bg-[#0C1220]">
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 uppercase mb-1">Input (JSON)</label>
        <textarea 
          {...register(`hiddenTestCases.${index}.input`)} 
          placeholder='{"list1": [1,2,4], "list2": [1,3,4]}' 
          className="bg-[#121826] border border-slate-800 p-3 rounded text-indigo-300 font-mono text-xs w-full min-h-[80px]" 
        />
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 uppercase mb-1">Output (JSON/Array)</label>
        <textarea 
          {...register(`hiddenTestCases.${index}.output`)} 
          placeholder="[1,1,2,3,4,4]" 
          className="bg-[#121826] border border-slate-800 p-3 rounded text-emerald-300 font-mono text-xs w-full min-h-[80px]" 
        />
      </div>
      <div className="flex items-center justify-end">
        <button 
          type="button" 
          onClick={() => removeHT(index)} 
          className="text-red-400 hover:text-red-300 text-xs px-3 py-1 border border-red-900 rounded"
        >
          Remove
        </button>
      </div>
    </div>
  ))}
  <button 
    type="button" 
    onClick={() => appendHT({ input: '{"list1": [], "list2": []}', output: "[]" })} 
    className="text-indigo-400 text-sm font-medium hover:underline"
  >
    + Add Hidden Case
  </button>
</section>

  {/* Start Code & Reference Solution */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <section>
      <h3 className="text-white font-semibold mb-3">Start Code</h3>
      {scFields.map((field, index) => (
        <div key={field.id} className="mb-4 p-4 border border-slate-800 rounded-xl bg-[#121826]">
          <input {...register(`startcode.${index}.language`)} placeholder="Language (e.g. javascript)" className="w-full bg-[#0C1220] border border-slate-800 p-2 rounded text-white mb-2" />
          <textarea {...register(`startcode.${index}.initialcode`)} placeholder="Initial Code" className="w-full bg-[#0C1220] border border-slate-800 p-2 rounded text-white h-20" />
          <button type="button" onClick={() => removeSC(index)} className="text-red-400 text-xs mt-1">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => appendSC({ language: "", initialcode: "" })} className="text-indigo-400 text-sm">+ Add Language</button>
    </section>

    <section>
      <h3 className="text-white font-semibold mb-3">Reference Solution</h3>
      {rsFields.map((field, index) => (
        <div key={field.id} className="mb-4 p-4 border border-slate-800 rounded-xl bg-[#121826]">
          <input {...register(`referencesolution.${index}.language`)} placeholder="Language" className="w-full bg-[#0C1220] border border-slate-800 p-2 rounded text-white mb-2" />
          <textarea {...register(`referencesolution.${index}.code`)} placeholder="Solution Code" className="w-full bg-[#0C1220] border border-slate-800 p-2 rounded text-white h-20" />
          <button type="button" onClick={() => removeRS(index)} className="text-red-400 text-xs mt-1">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => appendRS({ language: "", code: "" })} className="text-indigo-400 text-sm">+ Add Solution</button>
    </section>

    <section className="mt-8">
  <h3 className="text-white font-semibold mb-3">Driver Code (C++ Wrapper)</h3>
  <textarea 
    {...register("drivercode")} 
    placeholder="Enter the dynamic driver code here..." 
    className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none h-40 font-mono" 
  />
  {errors.drivercode && (
    <p className="text-rose-400 text-xs mt-1">{errors.drivercode.message}</p>
  )}
  <p className="text-slate-500 text-xs mt-2 italic">
    This code will be injected into the main() function to parse input and call the user's solution class.
  </p>
</section>
    <section className="space-y-4">
  <h3 className="text-white font-semibold">Problem Constraints</h3>
  <div className="bg-[#121826] p-6 rounded-xl border border-slate-800 space-y-6">
    
    {/* Time and Memory (Side by Side) */}
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Time Limit (s)</label>
        <input 
          type="number" 
          step="0.1" 
          {...register("constraints.timeLimit", { valueAsNumber: true })} 
          className="w-full bg-[#0C1220] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" 
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Memory Limit (MB)</label>
        <input 
          type="number" 
          {...register("constraints.memoryLimit", { valueAsNumber: true })} 
          className="w-full bg-[#0C1220] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" 
        />
      </div>
    </div>

    {/* Input Constraints (Full Width & Larger) */}
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
        Input Constraints Description
      </label>
      <textarea 
        {...register("constraints.inputConstraints")} 
        placeholder="e.g. 2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9" 
        className="w-full bg-[#0C1220] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none h-32 resize-y" 
      />
      {errors.constraints?.inputConstraints && (
        <p className="text-rose-400 text-xs mt-1">{errors.constraints.inputConstraints.message}</p>
      )}
    </div>
  </div>
</section>
  </div>
</div>

          <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
        >
          {isSubmitting ? "Updating..." : "Update Problem"}
        </button>
        </form>
      </div>
    </div>
  );
}