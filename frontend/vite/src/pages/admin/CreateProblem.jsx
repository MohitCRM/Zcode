import axiosClient from "../../utils/axiosClient";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import { Controller } from "react-hook-form";

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

 const problemschema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string())
    .min(1, "At least one tag is required")
    .refine((items) => items.every(item => leetcodeTags.includes(item)), {
      message: "One or more selected tags are invalid",
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
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    })
  ),
  
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
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


export default function CreateProblem() {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(problemschema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      tags: [],
      baseEloReward: 100,
      penaltyWrongAnswer: 10,
      penaltyTimeLimitExceeded: 10,
      penaltyRuntimeError: 10,
      penaltyCompilationError: 0,
      seasonId: 1,
      round: 1,
      releaseDay: 1,
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      startcode: [{ language: "javascript", initialcode: "" }],
      referencesolution: [{ language: "javascript", code: "" }],
      problemcreator: "" 
    }
  });

  // Setup Field Arrays for dynamic inputs
    const { fields: vtFields, append: appendVT, remove: removeVT } = useFieldArray({ control, name: "visibleTestCases" });
    const { fields: htFields, append: appendHT, remove: removeHT } = useFieldArray({ control, name: "hiddenTestCases" });
    const { fields: scFields, append: appendSC, remove: removeSC } = useFieldArray({ control, name: "startcode" });
    const { fields: rsFields, append: appendRS, remove: removeRS } = useFieldArray({ control, name: "referencesolution" });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        round: Number(data.round),
        seasonId: Number(data.seasonId),
        releaseDay: Number(data.releaseDay),
      };

      console.log(payload);

      const response = await axiosClient.post("/problem/create", payload);
      alert("Problem created successfully!");
    } catch (error) {
      console.error("Failed to create problem:", error);
      alert("Error creating problem");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Problem</h2>
        
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
      <div key={field.id} className="grid grid-cols-4 gap-2 mb-2">
        <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="bg-[#121826] border border-slate-800 p-2 rounded text-white" />
        <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="bg-[#121826] border border-slate-800 p-2 rounded text-white" />
        <input {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" className="bg-[#121826] border border-slate-800 p-2 rounded text-white" />
        <button type="button" onClick={() => removeVT(index)} className="text-red-400">Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => appendVT({ input: "", output: "", explanation: "" })} className="text-indigo-400 text-sm">+ Add Visible Case</button>
  </section>

  {/* Hidden Test Cases */}
  <section>
    <h3 className="text-rose-400 font-semibold mb-3">Hidden Test Cases</h3>
    {htFields.map((field, index) => (
      <div key={field.id} className="grid grid-cols-3 gap-2 mb-2">
        <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="bg-[#121826] border border-slate-800 p-2 rounded text-white" />
        <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="bg-[#121826] border border-slate-800 p-2 rounded text-white" />
        <button type="button" onClick={() => removeHT(index)} className="text-red-400">Remove</button>
      </div>
    ))}
    <button type="button" onClick={() => appendHT({ input: "", output: "" })} className="text-indigo-400 text-sm">+ Add Hidden Case</button>
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
  </div>
</div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all">
            Publish Problem
          </button>
        </form>
      </div>
    </div>
  );
}