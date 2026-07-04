import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getcurrentseason } from "../../slicers/seasonslice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../slicers/authslice";

// Schema for sign up form validation
const signupschema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

export default function Signup() {
  const [showPassword, setshowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isauth, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupschema) });

  useEffect(() => {
    if (isauth) {
      navigate("/");
    }
  }, [isauth, navigate]);

  const onsubmit = (data) => {
    dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        dispatch(getcurrentseason());
      })
      .catch((err) => {
        console.error("Registration failed:", err);
      });
  };

  return (
    <div className="bg-[#070C15] min-h-screen text-slate-200 antialiased relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Dynamic Background Matrix Overlay Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

      {/* Main Terminal Frame Container */}
      <div className="w-full max-w-4xl bg-[#0B111E]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 min-h-[480px]">
        
        {/* LEFT PANEL: Informational Welcome Panel */}
        <div className="w-full md:w-1/2 p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#0B111E] to-[#070C15] flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800/60">
          <div className="space-y-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white font-sans">
              Create your Zcode account
            </h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm">
              Join Seasonal Rated problem sets and scale your competitive rating index today.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs Layer */}
        <form onSubmit={handleSubmit(onsubmit)} className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-[#0C1220]/40 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Create Account</h3>
            <p className="text-slate-500 font-mono text-[11px]">INITIALIZE EXECUTOR IDENTITY PROTOCOLS</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-mono flex items-start gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Input Name field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Name</label>
              <input 
                {...register("firstName")}
                type="text" 
                placeholder="Superman"
                className="w-full bg-[#070C15] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
              />
              {errors.firstName && (
                <span className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  ⚠️ {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Input Email field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email</label>
              <input 
                {...register("emailId")}
                type="email" 
                placeholder="xyz@gmail.com"
                className="w-full bg-[#070C15] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
              />
              {errors.emailId && (
                <span className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  ⚠️ {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Input Password field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Password</label>
              <div className="relative">
                <input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070C15] border border-slate-800 rounded-xl px-4 py-2.5 pr-11 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setshowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs font-medium text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  ⚠️ {errors.password.message}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Action Trigger Row */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-500 font-medium">
                Already have an account?{" "}
                <Link 
                  to="/login"
                  className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors font-mono uppercase tracking-wide ml-0.5 underline underline-offset-4"
                >
                  Login
                </Link>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Just looking around?{" "}
                <Link 
                  to="/guest-login" // Make sure this route matches your guest login path in App.js
                  className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors font-mono uppercase tracking-wide ml-0.5 underline underline-offset-4"
                >
                  Enter as Guest
                </Link>
              </span>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}