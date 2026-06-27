import { useState } from "react";
import axiosClient from "../../utils/axiosClient";
import {z} from 'zod';


export default function SetTime() {
  const [datetime, setDatetime] = useState("");
  const [message, setMessage] = useState("");

  const handleAction = async (endpoint, payload = null) => {
    try {
      const res = payload 
        ? await axiosClient.post(endpoint, payload) 
        : await axiosClient.post(endpoint);
      setMessage(res.data.message || res.data.currentTime);
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred");
    }
  };

  const handleGetCurrentTime = async () => {
    try {
      const res = await axiosClient.get("/time/getcurrenttime");
      setMessage(`Current Time: ${res.data.currentTime}`);
    } catch (err) {
      setMessage("Failed to fetch time");
    }
  };

  

  return (
    <div className="max-w-md mx-auto mt-12 bg-[#0C1220] border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Time Configuration</h2>
      
      <div className="space-y-4">
        <input 
          type="datetime-local" 
          value={datetime} 
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full bg-[#121826] border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
        />

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction("/time/settime", { timestamp: datetime })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Set Time
          </button>
          <button 
            onClick={() => handleAction("/time/resettime")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-all"
          >
            Reset Time
          </button>
        </div>

        <button 
          onClick={handleGetCurrentTime}
          className="w-full border border-slate-700 hover:bg-[#161F30] text-slate-400 py-3 rounded-xl transition-all"
        >
          Get Current Time
        </button>
      </div>

      {message && (
        <div className="mt-6 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-sm font-medium text-center">
          {message}
        </div>
      )}
    </div>
  );
}