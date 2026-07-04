import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { guestlogin } from "../../slicers/authslice";
import { getcurrentseason } from "../../slicers/seasonslice"; 

const guestloginschema = z.object({
    firstName: z.string().min(3, "Name should contain at least 3 characters")
});

export default function GuestLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, isauth, error } = useSelector((state) => state.auth);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(guestloginschema) });
    
    useEffect(() => {
        if (isauth) {
            navigate("/");
        }
    }, [isauth, navigate]);
    
    const onsubmit = (data) => {
        console.log(data);
        dispatch(guestlogin(data))
          .unwrap()
          .then(() => {
            dispatch(getcurrentseason());
          })
          .catch((err) => {
            console.error("Guest registration failed:", err);
          });
    };

    return (
        <div className="bg-[#070C15] min-h-screen text-slate-200 antialiased relative flex items-center justify-center p-4 overflow-hidden select-none">
            {/* Dynamic Background Matrix Overlay Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

            {/* Main Container Split-Panel */}
            <div className="w-full max-w-4xl bg-[#0B111E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 min-h-[460px]">
                
                {/* LEFT PANEL: Form Inputs */}
                <form onSubmit={handleSubmit(onsubmit)} className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-[#0C1220]/40 space-y-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-wider text-white">Guest Entry</h3>
                        <p className="text-slate-500 font-mono text-[11px]">INITIALIZE UNVERIFIED SANDBOX SESSION</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-mono flex items-start gap-3">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Input First Name field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">First Name / Alias</label>
                            <input 
                                {...register("firstName")}
                                type="text" 
                                placeholder="e.g., GuestCoder"
                                className="w-full bg-[#070C15] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
                            />
                            {errors.firstName && (
                                <span className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1 font-mono">
                                    ⚠️ {errors.firstName.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Form Action Button Placement */}
                    <div className="pt-2 flex justify-center md:justify-start">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? "Initializing..." : "Enter Sandbox"}
                        </button>
                    </div>
                </form>

                {/* RIGHT PANEL: Guest Welcome CTA Hero Panel */}
                <div className="w-full md:w-1/2 p-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#0B111E] to-[#070C15] flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-slate-800/60">
                    <div className="space-y-5 max-w-sm flex flex-col items-center">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v-6.75a2.25 2.25 0 002.25-2.25z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white font-sans tracking-tight">
                            Explore Zcode
                        </h2>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            Test features inside our isolated environment. Compete in individual challenges without saving a long-term profile history.
                        </p>
                        
                        {/* Footer Navigation Link */}
                        <div className="pt-4 text-xs text-slate-500 font-medium">
                            Want to start your own journey?{" "}
                            <Link 
                                to="/signup"
                                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors font-mono uppercase tracking-wide ml-1 underline underline-offset-4"
                            >
                                Signup
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}